const { Router } = require("express");
const auth = require("../middlewares/auth");
const AntiEmbed = require("../../Functions/AntiEmbed");
module.exports.Router = class Staff extends Router {
  constructor() {
    super();
    this.get("/bug", auth, function (req, res) {
      // console.log(req.session);
      let errormsg, alertmsg;
      res.status(200).render("bug", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/bug", auth, function (req, res) {
      let errormsg, alertmsg;
      if (req.body.reportbug.length > 1200) {
        errormsg = "Max characters exceeded! (1200 characters)";
      } else if (req.body.reportbug.length < 10) {
        errormsg = "Brief report in more than 10 characters";
      } else {
        const AntiEmbed = require("../../Functions/AntiEmbed");
        req.bot.channels.cache.get("822943159486251078").send({
          embeds: [
            new AntiEmbed(req.bot)
              .setColor("DARK_BLUE")
              .setTitle("New Bug Report Received!")
              .setFooter({
                text: `Sent By: ${req.user.username}#${req.user.discriminator}`,
              })
              .setDescription(req.body.reportbug),
          ],
        });
        alertmsg = "Your report has been submited and will be reviewed!";
      }
      res.status(201).render("bug", {
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
