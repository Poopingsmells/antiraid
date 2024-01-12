const { Router } = require("express");
const { Permissions } = require("discord.js");
const GuildSettings = require("../../models/servers");
const CASES = require("../../models/cases");
const AntiEmbed = require("../../Functions/AntiEmbed");
const checkLogged = require("../middlewares/auth");
const words = require("../../models/wordFilters");

module.exports.Router = class Dashboard extends Router {
  constructor() {
    super();
    this.get("/servers/:id/actions", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await words.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find({ serverId: guild.id });
      cases.filter((cases) => cases);

      res.status(201).render("actions", {
        bot: req.bot,
        config: req.config,
        user: req.user,
        guild: guild,
        cases: cases,
        guild: guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/create", checkLogged, async (req, res) => {
      res.sendStatus(401);
    });
    this.get("/servers/:id/words-filter", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await words.findOne({ guildID: guild.id });
      if (!storedSettings) {
        const newSettings = new words({
          guildID: guild.id,
          Words: [],
        });
        await newSettings.save().catch(() => {});
        storedSettings = await words.findOne({ guildID: guild.id });
      }

      res.status(201).render("word-filter", {
        bot: req.bot,
        config: req.config,
        user: req.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/words-filter", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await words.findOne({ guildID: guild.id });
      if (!storedSettings) {
        const newSettings = new words({
          guildID: guild.id,
          Words: [],
        });
        await newSettings.save().catch(() => {});
        storedSettings = await words.findOne({ guildID: guild.id });
      }
      if (req.body.words) {
        req.body.words.split(",").forEach((word) => {
          storedSettings.Words.push(word);
        });
      }
      await storedSettings.save();
      res.status(201).render("word-filter", {
        bot: req.bot,
        config: req.config,
        user: req.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/others", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find(
        { serverId: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);

      res.status(201).render("others", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        infractions: cases,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/welcome", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find(
        { serverId: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);

      res.status(201).render("welcome", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        infractions: cases,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/roles", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find(
        { serverId: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);

      res.status(201).render("roles", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        infractions: cases,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/automod", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find(
        { serverId: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);

      res.status(201).render("automod", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        infractions: cases,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/servers/:id/logs", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      const cases = await CASES.find(
        { serverId: guild.id },
        { _id: false, auth: false },
      );
      cases.filter((cases) => cases);

      res.status(201).render("logs", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        infractions: cases,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/actions", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.deletecase) {
        CASES.findOneAndDelete(
          {
            serverId: req.params.id,
            caseId: req.body.deletecase,
          },
          (err, res) => {
            if (!res) {
              errormsg = "Error occured while deleting case !";
            } else {
              if (guild.channels.cache.get(storedSettings.mod)) {
                guild.channels.cache.get(storedSettings.mod).send({
                  embeds: [
                    new AntiEmbed(req.bot)
                      .setDescription("🗑️ A Case has been deleted!")
                      .addField("# Case Number:", `#${req.body.deletecase}`),
                  ],
                });
              }
              alertmsg = `Successfuly deleted case number ${req.body.deletecase}!`;
            }
          },
        );
      }

      const caseres = await CASES.find(
        { serverId: req.params.id },
        { _id: false, auth: false },
      );
      caseres.filter((cases) => cases);
      res.status(201).render("actions", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        cases: caseres,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/others", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.kickwarns) {
        storedSettings.warnsForKick = req.body.kickwarns; // We save the settings.
        await storedSettings.save().catch(() => {});
      }
      if (req.body.mutewarns) {
        storedSettings.warnsForMute = req.body.mutewarns; // We save the settings.
        await storedSettings.save().catch(() => {});
      }
      if (req.body.banwarns) {
        storedSettings.warnsForBan = req.body.banwarns; // We save the settings.
        await storedSettings.save().catch(() => {});
      }
      if (req.body.nickname) {
        if (req.body.nickname.length > 25) {
          errormsg = "Nickname can't be longer than 25 letter!";
        } else {
          guild.me.setNickname(req.body.nickname);
        }
      }
      res.status(201).render("others", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/welcome", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.leavechannel) {
        if (req.body.leavechannel == "None") {
          storedSettings.leaveChannel = "String";
        } else {
          storedSettings.leaveChannel = req.body.leavechannel;
        }
      }
      if (req.body.welcomechannel) {
        if (req.body.welcomechannel == "None") {
          storedSettings.welcomeChannel = "String";
        } else {
          storedSettings.welcomeChannel = req.body.welcomechannel;
        }
      }
      if (!req.body.welcomemsg) {
        storedSettings.welcomeMsg = "String";
      }
      if (req.body.welcomemsg) {
        if (req.body.welcomemsg.length < 10) {
          errormsg = "Welcome message can't be less than 10 letters";
        } else if (req.body.welcomemsg.length > 500) {
          errormsg = "welcome message can't be more than 500 letters";
        } else {
          storedSettings.welcomeMsg = req.body.welcomemsg;
        }
      }
      if (!req.body.leavemsg) {
        storedSettings.leaveMsg = "String";
      }
      if (req.body.leavemsg) {
        if (req.body.leavemsg.length < 10) {
          errormsg = "Leave message can't be less than 10 letters";
        } else if (req.body.leavemsg.length > 500) {
          errormsg = "Leave message can't be more than 500 letters";
        } else {
          storedSettings.leaveMsg = req.body.leavemsg;
        }
      }
      if (req.body.typemsg) {
        storedSettings.EmbedsForJoinLeave = req.body.typemsg;
      }
      alertmsg = "Successfully saved updates!";
      storedSettings.save();
      console.log({ saved: true });
      res.status(201).render("welcome", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/logs", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.auditchannel) {
        if (req.body.auditchannel == "None") {
          storedSettings.audit = "String";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.audit = req.body.auditchannel;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.modchannel) {
        if (req.body.modchannel == "None") {
          storedSettings.mod = "String";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.mod = req.body.modchannel;
          storedSettings.save().catch(() => {});
        }
      }
      alertmsg = "Success saved logs!";
      res.status(201).render("logs", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/roles", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.muterolesettings) {
        if (req.body.muterolesettings == "None") {
        } else if (req.body.muterolesettings == "remove") {
          storedSettings.mutedrole = "String";
          await storedSettings.save().catch(() => {});
        } else {
          storedSettings.mutedrole = req.body.muterolesettings;
          await storedSettings.save().catch(() => {});
        }
      }
      if (req.body.autorole) {
        if (req.body.autorole == "None") {
        } else if (req.body.autorole == "remove") {
          storedSettings.autorole = "String";
          await storedSettings.save().catch(() => {});
        } else {
          storedSettings.autorole = req.body.autorole;
          await storedSettings.save().catch(() => {});
        }
      }
      if (req.body.botautorole) {
        if (req.body.botautorole == "None") {
        } else if (req.body.botautorole == "remove") {
          storedSettings.botautorole = "String";
          await storedSettings.save().catch(() => {});
        } else {
          storedSettings.botautorole = req.body.botautorole;
          await storedSettings.save().catch(() => {});
        }
      }
      res.status(201).render("roles", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/servers/:id/automod", checkLogged, async (req, res) => {
      let alertmsg, errormsg;
      const guild = req.bot.guilds.cache.get(req.params.id);
      if (!guild) return res.redirect("/servers");
      const fetch = await guild.members.fetch(req.user.id).then((info) => {
        const member = guild.members.cache.get(info.id);
        if (!member) return res.redirect("/servers");
        if (
          !member.permissions.has("MANAGE_GUILD") &&
          !req.bot.config.dev.includes(req.user.id)
        )
          return res.redirect("/servers");
      });
      let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
      if (!storedSettings) {
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
      if (req.body.antispam) {
        if (req.body.antispam == "Disabled") {
          storedSettings.antispam = "0";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.antispam = req.body.antispam;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.antiraid) {
        if (req.body.antiraid == "Disabled") {
          storedSettings.AntiRaid = "0";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.AntiRaid = req.body.antiraid;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.links) {
        if (req.body.links === "false") {
          storedSettings.moderateLinks = false;
          storedSettings.save().catch(() => {});
        }
        if (req.body.links === "true") {
          storedSettings.moderateLinks = true;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.prof) {
        if (req.body.prof === "false") {
          storedSettings.moderateProfanity = false;
          storedSettings.save().catch(() => {});
        }
        if (req.body.prof === "true") {
          storedSettings.moderateProfanity = true;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.webhooks) {
        if (req.body.webhooks === "false") {
          storedSettings.moderateWebhooks = false;
          storedSettings.save().catch(() => {});
        }
        if (req.body.webhooks === "true") {
          storedSettings.moderateWebhooks = true;
          storedSettings.save().catch(() => {});
        }
      }
      console.log(req.body);
      await storedSettings.save().catch(() => {});
      res.status(201).render("automod", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport.user,
        guild,
        settings: storedSettings,
        alert: alertmsg,
        error: errormsg,
      });
    });
  }
};

module.exports.name = "/";
