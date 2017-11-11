# reaper

[![License](https://img.shields.io/github/license/w4/reaper.svg?style=flat-square)](https://github.com/w4/reaper) [![Downloads](https://img.shields.io/crates/d/reaper.svg?style=flat-square)](https://crates.io/crates/reaper) [![Version](https://img.shields.io/crates/v/reaper.svg?style=flat-square)](https://crates.io/crates/reaper)

[League of Legends](http://leagueoflegends.com) mass summoner name checker. Supply a region and a list
and the application will check the list for available summoner names. Common uses are finding quick
variations of your name or finding rare (or "OG") names for selling. An API Key is required to do use
this script, they are available for free from [Riot Games](https://developer.riotgames.com/).

You can find a list of the servers you can query from on
[Riot's website](https://developer.riotgames.com/regional-endpoints.html). Examples of inputs for
SERVER: `euw1`, `na1`, `pbe1`.

    Reaper 0.1.0
    Jordan Doyle <jordan@9t9t9.com>
    Scans over a given list for available usernames on League of Legends

    USAGE:
        reaper [FLAGS] [OPTIONS] <SERVER> <INPUT> <API KEY>

    FLAGS:
        -h, --help       Prints help information
        -V, --version    Prints version information
        -v, --verbose    Increases logging verbosity each use up to 3 times

    OPTIONS:
        -o, --output <FILE>    Sets an output file to write available usernames to

    ARGS:
        <SERVER>     Sets the server to search for usernames on
        <INPUT>      Sets the input file to use
        <API KEY>    Sets the API key to use

For example:

    ./reaper euw1 username_list.txt my-api-key -o output.txt

Will check the list `username_list.txt` for available summoner names on Europe West using API key `my-api-key` and
outputs what it finds to output.txt

### Installation

You can install via cargo by running `cargo install reaper`. This will install the latest version of reaper and the
executable will be available globally on your operating system.

Builds are available under [GitHub Releases](https://github.com/w4/reaper/releases) or you can build it from source
by pulling down the code and running `cargo build --release`.
