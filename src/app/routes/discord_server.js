const { Router } = require("express");
const CheckAuth = require("../middlewares/auth");

module.exports.Router = class Panel extends Router {
  constructor() {
    super();
    this.get("/", [CheckAuth], function (req, res) {
      res.redirect("https://discord.gg/fWQet4CZ8q");
    });
  }
};

module.exports.name = "/discord";
