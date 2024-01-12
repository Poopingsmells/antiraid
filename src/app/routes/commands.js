const { Router } = require("express");

module.exports.Router = class Commands extends Router {
  constructor() {
    super();
    this.get("/commands", function (req, res) {
      res.status(200).render("commands", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
      });
      // console.log(req.session.passport?.user);
    });
  }
};

module.exports.name = "/";
