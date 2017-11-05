const colors = require('colors');

console.error = (msg) => console.log("[".white + "!".red + "] ".white + msg.white);
console.info = (msg) => console.log("[".white + "-".green + "] ".white + msg.white);
console.warn = (msg) => console.log("[".white + "~".blue + "] ".white + msg.white);

exports.shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
