extern crate chrono;
#[macro_use]
extern crate clap;
extern crate fern;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate log;
extern crate ratelimit;
extern crate regex;
extern crate reqwest;

use std::time::Duration;
use std::error::Error;
use std::io::{BufRead, BufReader, Write};
use std::fs::{File, OpenOptions};
use std::path::Path;
use clap::{App, Arg};
use reqwest::StatusCode;
use regex::Regex;

lazy_static! {
    static ref CLIENT: reqwest::Client = reqwest::Client::new();
    static ref USERNAME_REGEX: Regex = Regex::new(r"^[0-9\p{L} _\\.]{3,16}$").unwrap();
}

fn setup_logger(verbosity: u64) -> Result<(), fern::InitError> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{} [{}] [{}] {}",
                chrono::Local::now().format("%e %b %Y %H:%M:%S%.3f"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(match verbosity {
            0 | 1 => log::LogLevelFilter::Info,
            2 => log::LogLevelFilter::Debug,
            _ => log::LogLevelFilter::Trace,
        })
        .level_for("reaper", match verbosity {
            0 => log::LogLevelFilter::Info,
            1 => log::LogLevelFilter::Debug,
            _ => log::LogLevelFilter::Trace,
        })
        .chain(std::io::stdout())
        .apply()?;

    Ok(())
}

fn argparse<'a, 'b>() -> clap::App<'a, 'b> {
    App::new("Reaper")
        .version(crate_version!())
        .author("Jordan Doyle <jordan@9t9t9.com>")
        .about("Scans over a given list for available usernames on League of Legends")
        .arg(Arg::with_name("SERVER")
                .help("Sets the server to search for usernames on")
                .required(true)
                .index(1))
        .arg(Arg::with_name("INPUT")
                .help("Sets the input file to use")
                .required(true)
                .index(2))
        .arg(Arg::with_name("API KEY")
                .help("Sets the API key to use")
                .required(true)
                .index(3))
        .arg(Arg::with_name("output")
                .short("o")
                .long("output")
                .value_name("FILE")
                .help("Sets an output file to write available usernames to")
                .takes_value(true))
        .arg(Arg::with_name("verbose")
                .short("v")
                .long("verbose")
                .multiple(true)
                .help("Increases logging verbosity each use up to 3 times"))
}

fn main() {
    let args = argparse().get_matches();

    setup_logger(args.occurrences_of("verbose")).expect("Failed to initialize logging.");

    info!("Reaper booting up.");

    // all our inputs below are required fields so we can unwrap them without any worries
    let server = args.value_of("SERVER").unwrap();
    let input = Path::new(args.value_of("INPUT").unwrap());
    let api_key = args.value_of("API KEY").unwrap();

    assert!(input.exists(), "Input file doesn't exist.");

    let output = args.value_of("output");

    // output is an optional field so we check if it has a value and if it does we build a
    // new File instance and create a new Option with it
    let output_file = if output.is_some() {
        match OpenOptions::new()
            .create(true)
            .append(true)
            .open(output.unwrap())
        {
            Ok(file) => Some(file),
            Err(e) => {
                error!("Couldn't open handle to output file. {}", e);
                panic!()
            }
        }
    } else {
        None
    };

    debug!("Finished parsing arguments");

    let mut ratelimit = ratelimit::Builder::new()
        .capacity(1) // number of tokens the bucket will hold
        .quantum(1) // add one token per interval
        .interval(Duration::new(1, 0)) // add quantum tokens every 1 second
        .build();

    for line in BufReader::new(File::open(input).unwrap()).lines() {
        let username = &line.unwrap();

        if !USERNAME_REGEX.is_match(username) {
            error!(
                "The username \"{}\" isn't a valid username, skipping.",
                username
            );
            continue;
        }

        debug!("Checking if \"{}\" is available", username);

        match send_request(server, api_key, username) {
            Ok(_) => {
                info!("{} is available!", username);

                if let Some(ref mut file) = output_file.as_ref() {
                    writeln!(file, "{}", username).unwrap();
                }
            }
            Err(e) => info!("{} is not available ({})", username, e),
        }

        ratelimit.wait();
    }
}

fn send_request(server: &str, api_key: &str, username: &str) -> Result<(), Box<Error>> {
    let resp = CLIENT
        .get(&format!(
            "https://{}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{}?api_key={}",
            server,
            username,
            api_key
        ))
        .send()?;

    debug!("{:?}", resp);

    if !resp.status().is_success() {
        if resp.status().eq(&StatusCode::NotFound) {
            Ok(())
        } else {
            Err(Box::from("Bad response from Riot API"))
        }
    } else {
        Err(Box::from("Username is taken"))
    }
}
