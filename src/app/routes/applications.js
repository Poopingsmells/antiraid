const { Router } = require("express");
const checkAuth = require("../middlewares/auth");
const Discord = require("discord.js");
const AntiEmbed = require("../../Functions/AntiEmbed");
const { stripIndents } = require("common-tags");

module.exports.Router = class API extends Router {
  constructor() {
    super();
    this.get("/", checkAuth, async (req, res) => {
      res.render("applications-view", {
        bot: req.bot,
        user: req.session.passport.user,
      });
    });
    this.get("/staff", checkAuth, async (req, res) => {
      let alertmsg, errormsg;
      res.status(200).render("staff-apps", {
        bot: req.bot,
        user: req.session.passport.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/staff", checkAuth, async (req, res) => {
      let alertmsg, errormsg;
      const embed = new AntiEmbed(req.bot)
        .addField(
          "Information",
          stripIndents`
            > User ID × ${req.user.id}
            > User Tag × ${req.user.username}#${req.user.discriminator}
            > Applied for × Staff
            `,
        )
        .addField("Why we should choose him", req.body.explain)
        .addField("Information", req.body.info)
        .addField("Projects", req.body.projects);
      try {
        const webhook = new Discord.WebhookClient({
          url: "https://canary.discord.com/api/webhooks/942485926934888492/-N2xg8586RES0LiIAsjzBZwJlieEKdw4e73IwwstDDO0VNrDjacSbui_ImmIw9UkCyeS",
        });
        webhook.send({
          embeds: [embed],
          username: req.bot.user.username,
          avatarURL: req.bot.user.displayAvatarURL(),
        });
        alertmsg = "I have sent your application to the Owner";
      } catch (err) {
        errormsg = "There was an error trying to send you application";
      }
      res.status(200).render("staff-apps", {
        bot: req.bot,
        user: req.session.passport.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/dev", checkAuth, async (req, res) => {
      let alertmsg, errormsg;
      res.status(200).render("dev-apps", {
        bot: req.bot,
        user: req.session.passport.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/dev", checkAuth, async (req, res) => {
      let alertmsg, errormsg;
      const embed = new AntiEmbed(req.bot)
        .addField(
          "Information",
          stripIndents`
            > User ID × ${req.user.id}
            > User Tag × ${req.user.username}#${req.user.discriminator}
            > Applied for × Developer
            `,
        )
        .addField("Why we should choose him", req.body.explanation)
        .addField("Frameworks", req.body.frameworks)
        .addField("Projects", req.body.projects)
        .addField("Languages", req.body.languages);
      try {
        const webhook = new Discord.WebhookClient({
          url: "https://canary.discord.com/api/webhooks/942485926934888492/-N2xg8586RES0LiIAsjzBZwJlieEKdw4e73IwwstDDO0VNrDjacSbui_ImmIw9UkCyeS",
        });
        webhook.send({
          embeds: [embed],
          username: req.bot.user.username,
          avatarURL: req.bot.user.displayAvatarURL(),
        });
        alertmsg = "I have sent your application to the Owner";
      } catch (err) {
        errormsg = "There was an error trying to send you application";
      }
      res.status(201).render("dev-apps", {
        bot: req.bot,
        user: req.session.passport.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
  }
};

module.exports.name = "/apply";
