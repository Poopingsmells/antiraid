const { Router } = require("express");
const { Permissions } = require("discord.js");
const GuildSettings = require("../../models/servers");
const CASES = require("../../models/cases");
const AntiEmbed = require("../../Functions/AntiEmbed");

function checkLogged(req, res, next) {
  return req.session.passport?.user
    ? next()
    : res.status(401).redirect("auth/login");
}

module.exports.Router = class Dashboard extends Router {
  constructor() {
    super();
    this.get("/servers", [checkLogged], function (req, res) {
      res.status(200).render("servers", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        perms: Permissions,
      });
    });
    this.get("/servers/:id", [checkLogged], async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const info = guild.members.fetch(req.user.id).then((info1) => {
        const member = guild.members.cache.get(info1.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      // We retrive the settings stored for this guild.
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
        const newSettings = new GuildSettings({
          guildID: guild.id,
          // channels
          welcomeChannel: "String",
          leaveChannel: "String",
          mod: "String",
          audit: "String",
          CanLockChannels: "String",
          // roles
          mutedrole: "String",
          botautorole: "String",
          autorole: "String",
          // important settings
          key: "String",
          highestCaseId: 0,
          antispam: "0", // 0: no antispam, 1: basic, 2: moderate, 3: severe
          moderateLinks: false,
          moderateProfanity: false,
          moderateWebhooks: false,
          warnsForKick: null,
          warnsForBan: null,
          warnsForMute: null,
          // saved messages
          welcomeMsg: "String",
          leaveMsg: "String",
          EmbedsForJoinLeave: "String",
          AntiRaid: "0",
        });
        await newSettings.save().catch(() => {});
        storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      }

      // We set the prefix of the server settings to the one that was sent in request from the form.
      // We save the settings.
      await storedSettings.save().catch(() => {});
      const cases = await CASES.find(
        { serverID: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);
      res.status(200).render("guild", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        perms: Permissions,
        guild: guild,
        infractions: cases,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id", [checkLogged], async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      // We retrive the settings stored for this guild.
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
        const newSettings = new GuildSettings({
          guildID: guild.id,
          // channels
          welcomeChannel: "String",
          leaveChannel: "String",
          mod: "String",
          audit: "String",
          CanLockChannels: "String",
          // roles
          mutedrole: "String",
          botautorole: "String",
          autorole: "String",
          // important settings
          key: "String",
          highestCaseId: 0,
          antispam: "0", // 0: no antispam, 1: basic, 2: moderate, 3: severe
          moderateLinks: false,
          moderateProfanity: false,
          moderateWebhooks: false,
          warnsForKick: null,
          warnsForBan: null,
          warnsForMute: null,
          // saved messages
          welcomeMsg: "String",
          leaveMsg: "String",
          EmbedsForJoinLeave: "String",
          AntiRaid: "0",
        });
        await newSettings.save().catch(() => {});
        storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      }

      // We set the prefix of the server settings to the one that was sent in request from the form.
      // We save the settings.
      await storedSettings.save().catch(() => {});
      if (req.body.leaveserver) {
        req.bot.guilds.cache.get(req.body.leaveserver).leave();
        return res.redirect("/");
      }
      const cases = await CASES.find(
        { serverID: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);
      res.status(200).render("guild", {
        bot: req.bot,
        guild: guild,
        config: req.config,
        user: req.session.passport.user,
        perms: Permissions,
        infractions: cases,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/fc", [checkLogged], function (req, res) {
      res.status(200).render("home");
    });
  }
};

module.exports.name = "/";
