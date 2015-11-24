console.error = function(msg)
{
	console.log("[".white + "!".red + "] ".white + msg.white);
};

console.info = function(msg)
{
	console.log("[".white + "-".green + "] ".white + msg.white);
};

console.warn = function(msg)
{
	console.log("[".white + "~".blue + "] ".white + msg.white);
};

exports.shuffle = function(array)
{
	var currentIndex = array.length;
	var temporaryValue;
	var randomIndex;

	while(currentIndex !== 0)
	{
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
}
