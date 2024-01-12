const { Router } = require("express");

module.exports.Router = class Commands extends Router {
  constructor() {
    super();
    this.get("/frequently-asked-questions", function (req, res) {
      res.status(200).render("faq", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
      });
    });
  }
};

module.exports.name = "/";
