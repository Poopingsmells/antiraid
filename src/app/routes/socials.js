const { Router } = require("express");
const CheckMaint = require("../middlewares/maintenance");

module.exports.Router = class Panel extends Router {
  constructor() {
    super();
    this.get("/twitter", function (req, res) {
      res.status(200).redirect("https://twitter.com/antiraiddbot");
    });
    this.get("/github", function (req, res) {
      res.status(200).redirect("https://github.com/Anti-Raid");
    });
  }
};

module.exports.name = "/socials";
