const { Router } = require("express");

module.exports.Router = class Commands extends Router {
  constructor() {
    super();
    this.get("/privacy", function (req, res) {
      res.status(200).render("privacy", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
      });
    });
  }
};

module.exports.name = "/";
