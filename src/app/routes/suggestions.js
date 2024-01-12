const { Router } = require("express");
const auth = require("../middlewares/auth");
const AntiEmbed = require("../../Functions/AntiEmbed");
module.exports.Router = class Staff extends Router {
  constructor() {
    super();
    this.get("/suggest", auth, function (req, res) {
      // console.log(req.session);
      let errormsg, alertmsg;
      res.status(200).render("suggestion", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/suggest", auth, function (req, res) {
      let errormsg, alertmsg;
      if (req.body.suggestion.length > 500) {
        errormsg = "Max characters exceeded! (1000 characters)";
      } else if (req.body.suggestion.length < 10) {
        errormsg = "Brief suggestion in more than 10 characters";
      } else {
        const AntiEmbed = require("../../Functions/AntiEmbed");
        req.bot.channels.cache.get("822943121293705226").send({
          embeds: [
            new AntiEmbed(req.bot)
              .setColor("DARK_RED")
              .setTitle("New Suggestion has Landed!")
              .setFooter({
                text: `Send By: ${req.user.username}#${req.user.discriminator}`,
              })
              .setDescription(req.body.suggestion),
          ],
        });
        alertmsg = "Your suggestion has been submited to developers!";
      }
      res.status(201).render("suggestion", {
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
