const { Router } = require("express");
const auth = require("../middlewares/auth");
const AntiEmbed = require("../../Functions/AntiEmbed");
module.exports.Router = class Staff extends Router {
  constructor() {
    super();
    this.get("/feedback", auth, function (req, res) {
      // console.log(req.session);
      let errormsg, alertmsg;
      res.status(200).render("feedback", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/feedback", auth, function (req, res) {
      let errormsg, alertmsg;
      if (req.body.feedback) {
        if (req.body.feedback.length > 3900) {
          errormsg = "Feedback message characters must be under 3900!";
        } else {
          const channel = req.bot.channels.cache.get(
            req.bot.config.discord.channels.feedback,
          );
          const embed = new AntiEmbed(req.bot)
            .setTitle("A Feedback has landed.")
            .setDescription(
              `${req.body.feedback}** - [${req.user.username}#${req.user.discriminator}]**`,
            )
            .setThumbnail(req.bot.user.displayAvatarURL());
          channel
            .send({ embeds: [embed] })
            .catch(() => console.log("Sended feedback"));
          alertmsg =
            "Your feedback has been sent! Thank you for using our bot <3";
        }
      }
      res.status(201).render("feedback", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
  }
};

module.exports.name = "/";
