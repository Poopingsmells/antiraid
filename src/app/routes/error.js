const { Router } = require("express");

module.exports.Router = class Commands extends Router {
  constructor() {
    super();
    this.get("/login-error", function (req, res) {
      res.status(403).send({
        error:
          "You were redirected here because you either didnt login or something broke on our side",
      });
    });
    this.get("/403", function (req, res) {
      res.render("403", {
        bot: req.bot,
        user: req.user,
      });
    });
  }
};

module.exports.name = "/";
