const { Router } = require("express");
const CheckMaint = require("../middlewares/maintenance");

module.exports.Router = class Panel extends Router {
  constructor() {
    super();
    this.get("/", function (req, res) {
      res.render("maintenance", {
        bot: req.bot,
        user: req.user,
      });
    });
  }
};

module.exports.name = "/maintenance";
