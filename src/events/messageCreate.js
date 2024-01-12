const servers = require("../models/servers");
const { addWebhookSpam, newCase } = require("../Functions/moderation");
const users_bl = require("../models/user_blacklist");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");
const guilds_bl = require("../models/guild_blacklist");
const stats = require("../models/bot_stats");
const ratetime = new Set();
const badword = require("bad-words");
const badWords = new badword();

module.exports = {
  name: "messageCreate",
  run: async (message) => {
    if (!message.guild) return;
    const serverData = await servers.findOne({ guildID: message.guild.id });
    if (!serverData) return;
    if (message.webhookId) return webhookMessage(message, serverData);
    if (message.author.bot) return botMessage(message, serverData);
    if (message.author) userMessage(message, serverData);
  },
};

// eslint-disable-next-line no-unused-vars
function botMessage(message, settings) {
  // eslint-disable-next-line no-empty-function
}

function webhookMessage(message, settings) {
  if (settings.moderateWebhooks) {
    addWebhookSpam(message);
  }
}

async function userMessage(message, settings) {
  // executeCommand_temporary(message);
  const cases = require("../models/cases");
  if (message.member.permissions.has("MANAGE_MESSAGES")) return;
  if (settings.moderateLinks) {
    const urlRegExp = new RegExp(
      "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+",
    );
    const result = message.content.match(urlRegExp);
    if (result) {
      message.delete();
      const data = await cases.find({ serverId: message.guild.id });
      new cases({
        caseId: data.length + 1,
        targetId: message.author.id,
        reason: "AutoMod × Link sent",
        type: "warn",
        serverId: message.guild.id,
        modId: "AutoMod",
      }).save();
      message.client.channels.cache.get(settings.mod).send({
        content: `⚠ AutoMod has detected that **${message.author.tag}** has used a link and i have warned them automatically!\n> This happens when chat moderation is activated in our dashboard\n× Message Content ( Without clean ): ${message.content}\n\n> To stop this you must disable chat moderation in our dashboard!`,
      });
    }
  }
  if (settings.moderateProfanity) {
    if (badWords.isProfane(message.content) === true) {
      // eslint-disable-next-line no-unused-vars
      const clearedText = badWords.clean(message.content);
      // warn user here
      message.delete();
      const data = await cases.find({ serverId: message.guild.id });
      new cases({
        caseId: data.length + 1,
        targetId: message.author.id,
        reason: "AutoMod × Profanity",
        type: "warn",
        serverId: message.guild.id,
        modId: "AutoMod",
      }).save();
      message.client.channels.cache.get(settings.mod).send({
        content: `⚠ AutoMod has detected that **${
          message.author.tag
        }** has used a bad word and i have warned them automatically!\n× Message Content ( Without clean ): ${
          message.content
        }\n× Message Content ( Cleared ): ${badWords.clean(
          message.content,
        )}\n\n> To stop this you must disable chat moderation in our dashboard!`,
      });
    }
  }
}
