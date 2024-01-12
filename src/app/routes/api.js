const { Router } = require("express");
// const bodyParser = require('body-parser');

module.exports.Router = class API extends Router {
  constructor() {
    super();
    // this.use('/csp-reports', bodyParser.json({ type: 'application/json' }));
    // this.use('/csp-reports', bodyParser.json({ type: 'application/csp-report' }));
    this.post("/csp-reports", function (req, res) {
      console.log(JSON.stringify(req.body));
      res.status(200).send({ successful: true });
    });
  }
};

module.exports.name = "/api";
