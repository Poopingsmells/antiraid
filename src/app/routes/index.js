const { Router } = require("express");

module.exports.Router = class Home extends Router {
  constructor() {
    super();
    this.get("/", function (req, res) {
      res.render("index", {
        bot: req.bot,
        user: req.session.passport?.user,
        config: req.config,
      });
      // console.log(req.session)
    });
  }
};

module.exports.name = "/";
