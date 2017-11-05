# reaper

[![License](https://poser.pugx.org/laravel/framework/license.svg)](http://github.com/jordandoyle/reaper)

[League of Legends](http://leagueoflegends.com) mass summoner name checker. Supply a region and a list and the script will check the list for available summoner names. Common uses are finding quick variations of your name or finding rare (or "OG") names for selling. An API Key is required to do use this script, they are available for free from [Riot Games](https://developer.riotgames.com/), the API key is set in **reaper.js**.

You can find a list of the servers you can query from on [Riot's website](https://developer.riotgames.com/regional-endpoints.html).

The syntax of reaper is very simple:

    node reaper.js [server (na1/euw1/la1/etc)] [username file] (output file)

For example:

    node reaper.js euw1 username_list.txt output.txt

Will check the list username_list.txt for available summoner names on Europe West and output what it finds to output.txt
