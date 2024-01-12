const { Router } = require("express");
const CheckAuth = require("../middlewares/auth");
const passport = require("passport");

module.exports.Router = class Auth extends Router {
  constructor() {
    super();
    this.get(
      "/login",
      async (req, res, next) => {
        if (req.session.backURL) {
          req.session.backURL = req.session.backURL; // eslint-disable-line no-self-assign
        } else {
          req.session.backURL = "/";
        }
        next();
      },
      passport.authenticate("discord", {
        successRedirect: "/",
        failureMessage: "You failed logging in cause something broke",
      }),
    );
    this.get("/logout", [CheckAuth], function (req, res) {
      req.session.destroy(() => {
        req.logout();
      });
      res.status(200).redirect("/");
    });
    this.get(
      "/callback",
      passport.authenticate("discord", {
        failureRedirect: "/login-error",
        successRedirect: "/",
      }),
      (req, res) => {
        // console.log(req.session)
        if (req.session.backURL) {
          const url = req.session.backURL;
          req.session.backURL = null;
          res.redirect(url);
        } else {
          res.redirect("/");
        }
      },
    );
  }
};

module.exports.name = "/auth";
