const web = require("../../src/app/index.js");
const Discord = require("discord.js");

const client = new Discord.Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
  intents: [
    1 << 0,
    1 << 2,
    1 << 3,
    1 << 3,
    1 << 4,
    1 << 5,
    1 << 6,
    1 << 7,
    1 << 8,
    1 << 9,
    1 << 10,
    1 << 11,
    1 << 12,
    1 << 13,
    1 << 14,
  ],
});

const app = new web(client, require("../../config"));

console.log("ready");
// to be finished
// final goal:
// when testing, run only the website instead of the whole bot
// that takes a huge lot of time to load
