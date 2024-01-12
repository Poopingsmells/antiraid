const express = require("express");
// const helmet = require('helmet');
const path = require("path");
const session = require("express-session");
// const MongoStore = require('connect-mongo');
const morgan = require("morgan");
const fs = require("fs");
const bodyParser = require("body-parser");
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const mongostore = require("connect-mongo")(session);

class Website {
  constructor(client, config) {
    this.app = express();
    this.config = config;
    this.client = client;
    try {
      this._setup();
      this._loadRoutes();
      this._start();
    } catch (e) {
      throw typeof e === "object" ? e : new Error(e);
    }
  }

  _setup() {
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "views"));
    // this.app.use(helmet());
    this.app.set("port", this.config.port || 3000);
    this.app.use(express.static(path.join(__dirname, "static")));
    this.app.use(
      morgan("dev", {
        skip: function (req, res) {
          return res.statusCode < 400;
        },
      }),
    );
    this.app.locals.domain = this.config.callbackURL.split("//")[1];
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(
      new Strategy(
        {
          clientID: this.config.id,
          clientSecret: this.config.clientSecret,
          callbackURL: `${this.config.callbackURL}`,
          scope: ["identify", "guilds"],
        },
        (accessToken, refreshToken, profile, done) => {
          process.nextTick(() => done(null, profile));
        },
      ),
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
    // this.app.use(bodyParser.json({
    // 	type: ['json', 'application/csp-report'],
    // }));
    this.app.use(
      session({
        secret: "You will never guess it haha",
        resave: false,
        saveUninitialized: false,
        cookie: {
          path: "/",
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 60 * 24 * 365,
        },
        store: new mongostore({ url: this.config.mongo_url }),
        /* store: MongoStore.create({
				mongoUrl: this.config.mongo_url,
				touchAfter: 1000 * 60 * 60 * 12,
				mongoOptions: {
					useNewUrlParser: true,
					useUnifiedTopology: true,
				},
			}),*/
      }),
    );
    this.app.use((req, res, next) => {
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type",
      );
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE",
      );
      res.setHeader("Access-Control-Allow-Credentials", true);
      // eslint-disable-next-line quotes
      // res.setHeader('Content-Security-Policy', "default-src 'self' cdnjs.cloudflare.com 'unsafe-inline' *.gstatic.com; img-src 'self' cdn.discordapp.com; script-src unpkg.com 'self' 'unsafe-inline'; style-src 'self' * 'unsafe-inline'; report-uri /api/reports");
      req.config = this.config;
      req.bot = this.client;
      if (req.session.passport) {
        req.user = req.session.passport.user;
      }
      next();
    });
  }

  _loadRoutes() {
    fs.readdir(path.join(__dirname, "routes"), (err, files) => {
      if (err) throw new Error(err);
      const routes = files.filter((c) => c.split(".").pop() === "js");
      if (files.length === 0 || routes.length === 0)
        throw new Error("Application online on port");
      for (let i = 0; i < routes.length; i++) {
        const route = require(`./routes/${routes[i]}`);
        this.app.use(route.name, new route.Router());
      }
    });
  }

  _start() {
    try {
      this.app.listen(this.app.get("port"));
      console.log(`Application online on port ::${this.app.get("port")}::`);
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = Website;
