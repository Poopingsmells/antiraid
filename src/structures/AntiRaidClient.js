const { Client, Collection, Intents } = require("discord.js");
const botconfiguration = require("../../config");
const cmd = require("../loaders/command");
const events = require("../loaders/event");
const errorHandler = require("../loaders/error");
const Utils = require("../Functions/Utils");
const Logger = require("../Functions/Logger");
const Checkers = require("../Functions/Checks");
const BotLists = require("../Functions/BotLists");
const logger = require("../loaders/logger");
class AntiRaidClient extends Client {
  /**
   * @param {botconfiguration} config
   */
  constructor(config) {
    super({
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
    this.config = config;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();
    this.buttons = new Collection();
    this.limits = new Map();
    this.snipe = new Set();
    this.snipes = new Map();
    this.esnipes = new Map();
    this.checks = new Checkers();
    this.utils = new Utils(this);
    this.lists = new BotLists(this);
    this.logs = new Logger(this);
    this.prefix = "lol";
    this.dbCache = {
      users: "cache",
      guilds: "cache",
    };
  }
  _loadCommands() {
    cmd.run(this);
  }
  _loadEvents() {
    events.run(this);
  }
  _loadErrorHandler() {
    errorHandler.run(this);
  }
  _loadLogs() {
    logger.run(this);
  }
  _start(token) {
    this._loadErrorHandler();
    this._loadEvents();
    this._loadCommands();
    this._loadLogs();
    super.login(token);
  }
}

module.exports = AntiRaidClient;
