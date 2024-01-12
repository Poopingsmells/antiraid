const { Router } = require("express");

module.exports.Router = class Staff extends Router {
  constructor() {
    super();
    this.get("/staff", function (req, res) {
      res.status(403).send({
        error:
          "We are experiencing some errors with staff page and we are currently fixing it!",
      });
      // 			res.status(200).render('staff', {
      // 				bot: req.bot,
      // 				config: req.config,
      // 				user: req.session.passport?.user,
      // 			});
    });
  }
};

module.exports.name = "/";
