const cases = require("../models/cases");
const members = require("../models/member");
const servers = require("../models/servers");
// eslint-disable-next-line no-unused-vars
const { Collection, Message, GuildMember, Client } = require("discord.js");
const AntiEmbed = require("./AntiEmbed");

const webhookModeration = new Collection();

const automodWarns = {
  1: "Link detected",
  2: "Profanity detected",
  3: "Spam detected",
};

// caseData: { action, reason, target, mod }
/**
 * @param {Object} caseData
 * @param {GuildMember} caseData.target
 * @param {String} caseData.reason
 * @param {String} caseData.action
 * @param {String} [casaData.mod]
 */
const newCase = async (caseData) => {
  const { target, reason, action, mod } = caseData;
  const serverData = await servers.findOne(
    { guildID: target.guild.id },
    {
      $inc: {
        highestCaseId: 1,
      },
    },
  );
  new cases({
    caseId: serverData.highestCaseId,
    targetId: target.user.id,
    reason,
    type: action,
    serverId: target.guild.id,
    modId: mod ?? "automod",
  })
    .save()
    .catch(() => console.log("this works"));
  const logData = {
    id: 2,
    fieldsData: [
      { name: "ID", value: serverData.highestCaseId },
      { name: "Target", value: `${target.user.username} (${target.user.id})` },
      { name: "Action", value: target.client.utils.capitalise(action) },
    ],
  };
  target.client.emit("log", target.guild, logData);

  return { caseId: serverData.highestCaseId };
};

/**
 * @param {Message} message
 */
const addWebhookSpam = async (message) => {
  let score = 2;
  if (message.content?.length > 100) score++;
  if (message.mentions.everyone) score = score + 4;
  if (message.mentions.roles) score = score + 2;
  if (message.mentions.users || message.mentions.members) score++;
  const current = webhookModeration.get(message.webhookId) || 0;
  if (current + score > 10) {
    try {
      message.fetchWebhook().then(async (webhook) => {
        webhook
          .send({ content: "[AntiRaid] Deleting webhook. Spam detected" })
          .then(() => {
            webhook.delete("Spam detected from this webhook");
          });
      });
    } catch {
      message.channel.send({
        embeds: [
          new AntiEmbed(message.client).error(
            "Detected spamming webhook. Unable to delete. \nCommon reason: missing `MANAGE_WEBHOOKS` permission",
          ),
        ],
      });
    }
  }
  webhookModeration.set(message.webhookId, current + score);

  setTimeout(() => {
    webhookModeration.set(
      message.webhookId,
      webhookModeration.get(message.webhookId) - score,
    );
  }, 10e3);
};

/**
 * @typedef {Object} returnData
 * @param {String} action
 * @param {Number} caseId
 * @param {Boolean} success
 */

/**
 * @typedef {Object} actionData
 * @param {String} mod
 * @param {String|Number} [reason]
 */

/**
 * @param {actionData} banData
 * @param {GuildMember} target
 * @returns {returnData}
 */
const newBan = async (banData, target) => {
  if (!target.manageable || !target.kickable)
    return {
      action: "Could not ban because member has a higher or equal role.",
      caseId: 0,
      success: false,
    };
  const modtag =
    target.client.users.cache.get(banData.mod)?.tag ?? `Mod ID: ${banData.mod}`;
  target
    .ban({ reason: `[${modtag}] - ${banData.reason ?? "No reason specified"}` })
    .catch(() => {
      return {
        action: "There was an unexpected error",
        caseId: 0,
        success: false,
      };
    });
  newCase({
    target,
    reason: banData.reason,
    action: "ban",
    mod: banData.mod,
  }).then((caseReturnData) => {
    return { success: true, caseId: caseReturnData.caseId, action: "ban" };
  });
};

/**
 * @param {actionData} kickData
 * @param {GuildMember} target
 * @returns {returnData}
 */
const newKick = async (kickData, target) => {
  if (!target.manageable || !target.kickable)
    return {
      action: "Could not kick because member has a higher or equal role.",
      caseId: 0,
      success: false,
    };
  const modtag =
    target.client.users.cache.get(kickData.mod)?.tag ??
    `Mod ID: ${kickData.mod}`;
  target
    .kick(`[${modtag}] - ${kickData.reason ?? "No reason specified"}`)
    .catch(() => {
      return {
        action: "There was an unexpected error",
        caseId: 0,
        success: false,
      };
    });
  newCase({
    target,
    reason: kickData.reason,
    action: "kick",
    mod: kickData.mod,
  }).then((caseReturnData) => {
    return { success: true, caseId: caseReturnData.caseId, action: "kick" };
  });
};

/**
 * @param {actionData} warnData
 * @param {GuildMember} target
 * @returns {returnData}
 */
const newWarn = async (warnData, target) => {
  const serverData = servers.findOne({ guildID: target.guild.id });
  const memberData = await members.findOneAndUpdate(
    { guild: target.guild.id, user: target.user.id },
    {
      $inc: {
        activeWarns: 1,
      },
    },
  );
  const automodData = warnData.automod;
  const memberActiveWarns = memberData.activeWarns;

  let action = "warn";
  if (serverData.warnsForMute && memberActiveWarns > serverData.warnsForMute)
    action = "mute";
  if (serverData.warnsForKick && memberActiveWarns > serverData.warnsForKick)
    action = "kick";
  if (serverData.warnsForBan && memberActiveWarns > serverData.warnsForBan)
    action = "ban";

  if (action !== "warn") {
    members.findOneAndUpdate(
      { guild: target.guil.id, user: target.user.id },
      { activeWarns: 0 },
    );
    if (action == "ban") {
      newBan({ mod: "automod", reason: "Ban threshold reached" }, target);
    } else if (action == "kick") {
      newKick({ mod: "automod", reason: "Kick threshold reached" }, target);
    } else {
      // newMute({ mod: 'automod', reason: 'Mute threshold reached' }, target);
    }
  }
  let reason = "No reason specified";
  if (warnData.reason) reason = warnData.reason;
  if (warnData.mod == "automod") reason = automodWarns[warnData.reason];
  const caseReturnData = await newCase({
    action: "warn",
    reason,
    target,
    mod: warnData.modId ? warnData.modId : "automod",
    automod: automodData ?? null,
  });
  // if (action !== 'warn') await newCase({ action, reason: target.client.utils.capitalise(action) + ' threshold reached', target, mod: 'automod' });
  target.client.emit("log", target.guild, {
    action: "warn",
    id: 2,
    target,
    mod: warnData.modId ? warnData.modId : "automod",
    reason,
    automod: automodData ?? null,
    fieldsData: [
      { name: "Moderator", value: warnData.modId ? warnData.modId : "Automod" },
    ],
  });
  return { caseId: caseReturnData.caseId, action, success: true };
};

module.exports = {
  newCase,
  newBan,
  newKick,
  newWarn,
  addWebhookSpam,
};
