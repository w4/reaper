var common = require('./common');

var colors = require('colors');
var chunk = require('chunk');
var args = process.argv.slice(2);

var fs = require('fs');
var http = require('http');
var https = require("https");

if(args.length < 2 || args.length > 3)
{
	console.error("Invalid syntax. Valid syntax: " + process.argv[0] + " " + process.argv[1] + " [server] [username input] (username output)");
}

var apiKey = "<api key here>";

var server = args[0];
var input = args[1];
var output = args[2];

var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(1, 'second');

var namesChecked = 0;
var namesFound = 0;

// basic http server for logging
http.createServer(function(req, res)
{
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('Names Checked: ' + namesChecked + '\nNames Found: ' + namesFound);
}).listen(8090);

var names = fs.readFileSync(input).toString().split('\n');

// shuffle the list of names passed in
common.shuffle(names);

// check names in chunks of 40
chunk(names, 40).forEach(function(chunked)
{
	limiter.removeTokens(1, function(err, remainingRequests)
	{
		namesChecked += 40;

		var users = chunked.join(',').replace(/[-]/g, ' ').replace(/[\r\n'.]/g, '');

		// make a secure request to the specified server
		https.get('https://' + server + '.api.pvp.net/api/lol/' + server + '/v1.4/summoner/by-name/' + users + '?api_key=' + apiKey, function(res)
		{
			// riot returns a 404 if none of the names are registered
			if(res.statusCode === 404) {
				chunked.forEach(function(name)
				{
					namesFound++;
					console.info(name.replace(/[-]/g, ' ').replace(/[\r\n'.]/g, '') + " is available!");

					if(output != undefined)
						fs.appendFile(output, name + '\n');
				});
			} else if(res.statusCode === 200) {
				var body = '';
				res.setEncoding('utf8');

				res.on('data', function(d) {
					body += d;
				});

				res.on('end', function()
				{
					var obj = JSON.parse(body);
					
					chunked.forEach(function(name)
					{
						name = name.replace(/[-]/g, ' ').replace(/[\r\n'.]/g, '').trim();

						if(name.length < 3)
							return;

						if(obj[name] == undefined)
						{
							if(output != undefined)
								fs.appendFile(output, name + '\r\n');

							console.info(name + " is available!");
							namesFound++;
						}
					});
				});
			}
		});
	});
});
