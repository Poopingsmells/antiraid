const { Router } = require("express");
const CheckAuth = require("../middlewares/auth");

module.exports.Router = class Panel extends Router {
  constructor() {
    super();
    this.get("/", [CheckAuth], function (req, res) {
      res.status(201);
    });
  }
};

module.exports.name = "/panel";
