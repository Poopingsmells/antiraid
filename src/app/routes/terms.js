const { Router } = require("express");

module.exports.Router = class Commands extends Router {
  constructor() {
    super();
    this.get("/tos", function (req, res) {
      res.status(200).render("terms", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
      });
    });
  }
};

module.exports.name = "/";
