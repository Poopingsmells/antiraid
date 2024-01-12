const { Router } = require("express");
const CheckAuth = require("../middlewares/auth");

module.exports.Router = class Panel extends Router {
  constructor() {
    super();
    this.get("/", [CheckAuth], function (req, res) {
      res.redirect(
        "https://discord.com/api/oauth2/authorize?client_id=858308969998974987&scope=bot+applications.commands&permissions=8",
      );
    });
  }
};

module.exports.name = "/invite";
