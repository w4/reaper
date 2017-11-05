"use strict";

const common = require('./common');
const chunk = require('chunk');
const fs = require('fs');
const https = require('https');
const RateLimiter = require('limiter').RateLimiter;

const args = process.argv.slice(2);

if(args.length < 2 || args.length > 3) {
    console.error("Invalid syntax. Valid syntax: " + process.argv[0] + " " + process.argv[1] + " [server] [username input] (username output)");
}

const apiKey = "<api key here>";

const server = args[0];
const input = args[1];
const output = args[2];

const limiter = new RateLimiter(1, 'second');

const names = fs.readFileSync(input).toString().split('\n');

// shuffle the list of names passed in
common.shuffle(names);

for (let name of names) {
    name = name.replace(/[-]/g, ' ').replace(/[\r\n'.]/g, '').trim();

    if(name.length < 3)
        continue;

    limiter.removeTokens(1, () => {
        // make a secure request to the specified server
        https.get(`https://${server}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${name}?api_key=${apiKey}`, (res) => {
            // riot returns a 404 if none of the names are registered
            if(res.statusCode === 404) {
                console.info(name.replace(/[-]/g, ' ').replace(/[\r\n'.]/g, '') + " is available!");

                if(output !== undefined)
                    fs.appendFile(output, name + '\n', () => null);
            }
        });
    });
}