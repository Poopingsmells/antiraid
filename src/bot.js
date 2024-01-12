const { Client, Collection, Intents } = require("discord.js");

const client = new Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
});

const config = require("../config");
const Utils = require("./Functions/Utils");
const Logger = require("./Functions/Logger");
const Checkers = require("./Functions/Checks");
const { readdirSync } = require("fs");
const { join } = require("path");
const loadersPath = join(__dirname, "loaders");

client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.buttons = new Collection();
client.limits = new Map();
client.snipe = new Set();
client.snipes = new Map();
client.esnipes = new Map();
client.config = config;
client.checks = new Checkers();
client.utils = new Utils(client);
client.lists = null;
client.logs = new Logger(client);
client.prefix = "lol";
client.dbCache = {
  users: "cache",
  guilds: "cache",
};

for (const loaderFile of readdirSync(loadersPath).filter((cmdFile) =>
  cmdFile.endsWith(".js"),
)) {
  const loader = require(`${loadersPath}/${loaderFile}`);
  loader.run(client);
}

client.login(config.token);
