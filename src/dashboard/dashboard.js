/* eslint-disable no-undef */
/* eslint-disable no-lonely-if */
/* eslint-disable no-empty */
/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable no-redeclare */
/* eslint-disable no-empty-function */
/* eslint-disable no-shadow */
/* eslint-disable no-inline-comments */
/* eslint-disable no-unused-vars */
// We import modules.
const url = require("url");
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const config = require("../../config");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const GuildSettings = require("../models/servers");
const ERRORS = require("../models/errors");
const suggestions = require("../models/suggestions");
const CASES = require("../models/cases");
const USERS = require("../models/users");
const ratelimit = new Set();
const users_bl = require("../models/user_blacklist");
const guilds_bl = require("../models/guild_blacklist");
const dev = require("../models/dev");
const CHARTS = require("chart.js");
// We instantiate express app and the session store.
const app = express();
const MongoStore = require("connect-mongo")(session);
const ms = require("ms");
const chart = require("chart.js");
const stats = require("../models/bot_stats");
const { readSync } = require("fs");
const servers = require("../models/servers");
const { S_IFDIR } = require("constants");
const apps = require("../models/apps_status");
// We export the dashboard as a function which we call in ready event.
module.exports = async (client) => {
  // We declare absolute paths.
  const dataDir = path.resolve(
    `${process.cwd()}${path.sep}src${path.sep}dashboard`,
  ); // The absolute path of current this directory.
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.

  // Deserializing and serializing users without any additional logic.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  // We set the passport to use a new discord strategy, we pass in client id, secret, callback url and the scopes.
  /** Scopes:
   *  - Identify: Avatar's url, username and discriminator.
   *  - Guilds: A list of partial guilds.
   */
  passport.use(
    new Strategy(
      {
        clientID: config.betaid,
        clientSecret: config.betaClientSecret,
        callbackURL: `${config.domain}/callback`,
        scope: ["identify", "guilds"],
      },
      (accessToken, refreshToken, profile, done) => {
        // eslint-disable-line no-unused-vars
        // On login we pass in profile with no logic.
        process.nextTick(() => done(null, profile));
      },
    ),
  );
  // We initialize the memorystore middleware with our express app.
  app.use(
    session({
      store: new MongoStore({ url: config.mongo_url }),
      secret:
        "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    }),
  );

  // We initialize passport middleware.
  app.use(passport.initialize());
  app.use(passport.session());

  // We bind the domain.
  app.locals.domain = config.domain.split("//")[1];

  // We set out templating engine.
  app.engine("html", ejs.renderFile);
  app.set("view engine", "html");

  // We initialize body-parser middleware to be able to read forms.
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  // We declare a renderTemplate function to make rendering of a template in a route as easy as possible.
  const renderTemplate = async (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
      ms: ms,
      chart: chart,
      u: await USERS,
    };
    // We render template using  the absolute path of the template and the merged default data with the additional data provided.
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data),
    );
  };
  // We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
  const checkAuth = async (req, res, next) => {
    // If authenticated we forward the request further in the route.
    if (req.isAuthenticated()) return next();
    // If not authenticated, we set the url the user is redirected to into the memory.
    req.session.backURL = req.url;
    // We redirect user to login endpoint/route.
    res.redirect("/login");
  };

  // Login endpoint.
  app.get(
    "/login",
    async (req, res, next) => {
      // We determine the returning url.
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL; // eslint-disable-line no-self-assign
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/";
      }
      // const t = await new USERS({userID: req.user.id, bio: "Yoo im cool", badge: ["Member"]}).save();
      // Forward the request to the passport middleware.
      next();
    },
    passport.authenticate("discord"),
  );
  // Callback endpoint.
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    /* We authenticate the user, if user canceled we redirect him to index. */ (
      req,
      res,
    ) => {
      // If user had set a returning url, we redirect him there, otherwise we redirect him to index.
      if (req.session.backURL) {
        const url = req.session.backURL;
        req.session.backURL = null;
        res.redirect(url);
      } else {
        res.redirect("/");
      }
    },
  );

  // Logout endpoint.
  app.get("/logout", function (req, res) {
    // We destroy the session.
    req.session.destroy(() => {
      // We logout the user.
      req.logout();
      // We redirect user to index.
      res.redirect("/");
    });
  });

  ////////////////////////////////////////////////////// WEBHOOKS /////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //         Install quick.db for simple operations like this to reduce deley
  //
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //	app.post("/voted", (req, res) => {
  //  if (req.header('Authorization') != "masterantiraidbotcallbackvoted") {
  //    return res.status("401").end();
  //  }
  //
  //    const requestvoteid = req.body.user || req.body.id;
  //    let votedtimes = db.get(`votes_${requestvoteid}`);
  // if (!votedtimes) votedtimes = "1";
  //
  //    db.add(`votes_${requestvoteid}`, 1)
  //
  // let usertag;
  // const User = client.users.cache.get(`${requestvoteid}`);
  // if (User) {
  //    usertag = User.tag;
  // } else {
  //    usertag = "Unknown"
  // };
  //
  //    const row = new MessageActionRow()
  //          .addComponents(
  //            new MessageButton()
  //              .setStyle("LINK")
  //              .setLabel("Top.gg")
  //              .setURL("https://discord.bots.gg/bots/858308969998974987")
  //          )
  //          .addComponents(
  //            new MessageButton()
  //              .setStyle("LINK")
  //              .setLabel("Voidbots")
  //              .setURL("https://voidbots.net/bot/924540290461736971/vote")
  //          )
  //          .addComponents(
  //            new MessageButton()
  //              .setStyle("LINK")
  //              .setLabel("Fateslist")
  //              .setURL("https://fateslist.xyz/bot/924540290461736971/vote")
  //          )
  //
  // let Embedvoteded = new MessageEmbed()
  // .setTitle(` <:Management:931780490011222036> **${usertag}** has just upvoted ANtiRaid! :hearts:`)
  // .setColor("GREEN")
  // .setDescription(' <:righttt:937969209374310420> https://top.gg/bot/858308969998974987 \n <:righttt:937969209374310420> https://voidbots.net/bot/858308969998974987 \n <:righttt:937969209374310420> https://fateslist.xyz/bot/858308969998974987')
  // .setFooter({ text: `${usertag} has upvoted AntiRaid: ${votedtimes} times so far!`})
  // .setTimestamp()
  // const channelvoted = client.channels.cache.get('939720641450508328');
  // channelvoted.send({ embeds: [Embedvoteded], components: [row] });
  //
  //  res.status(200).end()
  // })

  ////////////////////////////////////////////////////////////////// API ////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //         Posibly coming soon
  //
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Index endpoint.
  app.get("/", async (req, res) => {
    const st = await stats.findOne({});
    const stusers = client.users.cache.size;
    // const stusers = await client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)').then(x => x.reduce((a, b) => b + a));
    renderTemplate(res, req, "index.ejs", {
      alert: null,
      error: null,
      stats: st,
      users: stusers,
    });
  });
  app.get("/terms", (req, res) => {
    renderTemplate(res, req, "terms.ejs", { alert: null, error: null });
  });
  app.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/yUQcRmVrWA");
  });
  app.get("/api/stats", async (req, res) => {
    renderTemplate(res, req, "stats.ejs", { alert: null, error: null });
  });
  app.get("/bug", checkAuth, (req, res) => {
    renderTemplate(res, req, "bug.ejs", { alert: null, error: null });
  });
  app.get("/faq", (req, res) => {
    renderTemplate(res, req, "faq.ejs", { alert: null, error: null });
  });
  app.get("/suggest", checkAuth, (req, res) => {
    renderTemplate(res, req, "suggest.ejs", { alert: null, error: null });
  });
  app.get("/staff", async (req, res) => {
    const status = {
      dnd: "🔴 Do Not Disturb",
      idle: "🟡 Idle / Away",
      online: "🟢 Online",
      offline: "⚫ Invisible / Offline",
    };
    const badgest = {
      Member: "fa fa-users",
      Developer: "fa fa-code",
      Staff: "fa fa-wrench",
      Partner: "fa fa-handshake-o",
      Donator: "fa fa-diamond",
      Blacklisted: "fa fa-user-times",
    };
    renderTemplate(res, req, "staff.ejs", {
      alert: null,
      error: null,
      status: status,
    });
  });
  app.get("/invite", (req, res) => {
    res.redirect(
      "https://discord.com/oauth2/authorize?client_id=793970956610699315&permissions=268438576&scope=bot",
    );
  });
  app.get("/news", async (req, res) => {
    renderTemplate(res, req, "news.ejs", { alert: null, error: null });
  });
  app.get("/premium", async (req, res) => {
    renderTemplate(res, req, "premium.ejs", { alert: null, error: null });
  });
  app.get("/partners", checkAuth, async (req, res) => {
    renderTemplate(res, req, "partners.ejs", { alert: null, error: null });
  });
  app.get("/apps", checkAuth, async (req, res) => {
    const apsr = await apps.findOne({});
    renderTemplate(res, req, "apps.ejs", {
      alert: null,
      error: null,
      apps: apsr,
    });
  });
  app.get("/blacklist", checkAuth, async (req, res) => {
    const user = await USERS.findOne(
      { userID: req.user.id },
      async (err, data) => {
        if (
          data.badge.includes("Staff") ||
          data.badge.includes("Developer") ||
          config.dev.includes(req.user.id)
        ) {
          renderTemplate(res, req, "blacklist.ejs", {
            alert: null,
            error: null,
          });
        } else {
          res.status(403);
        }
      },
    );
  });
  app.get("/secret-page", checkAuth, async (req, res) => {
    let alertmsg = "",
      errormsg = "";
    const u = await USERS.findOne({ userID: req.user.id });
    if (config.staff.includes(req.user.id)) {
      alertmsg = "Welcome to the top secret page!";
      return renderTemplate(res, req, "secret-page.ejs", {
        alert: `${alertmsg}`,
        error: `${errormsg}`,
      });
    } else {
      errormsg = "Not welcome to the top secret page";
      res.status(403);
      // renderTemplate("")
      // res.redirect("/")
      return renderTemplate(res, req, "403.ejs", {
        alert: `${alertmsg}`,
        error: `${errormsg}`,
      });
    }
  });
  app.get("/api/users", checkAuth, async (req, res) => {
    const u = await USERS.find({});
    renderTemplate(res, req, "users.ejs", {
      alert: null,
      error: null,
      users: u,
      uu: USERS,
    });
  });
  app.get("/blacklisted", checkAuth, async (req, res) => {
    const guildss = await guilds_bl.find({}),
      userss = await users_bl.find({});
    const user = await USERS.findOne(
      { userID: req.user.id },
      async (err, data) => {
        if (
          data.badge.includes("Staff") ||
          data.badge.includes("Developer") ||
          config.dev.includes(req.user.id)
        ) {
          renderTemplate(res, req, "blacklisted.ejs", {
            alert: null,
            error: null,
            bl_guilds: guildss,
            bl_users: userss,
          });
        } else {
          res.status(403);
        }
      },
    );
  });
  app.post("/apps", checkAuth, async (req, res) => {
    let alertmsg = "";
    const errormsg = "";
    client.channels.cache
      .get("822942775703240707")
      .send("An Application has Received from website!");
    client.channels.cache.get("822942775703240707").send(
      new Discord.MessageEmbed()
        .setAuthor(
          `Application From: ${
            client.users.cache.get(req.user.id).tag
          }\nQuestion 1: Role`,
        )
        .setColor("BLUE")
        .setDescription(`\`${req.body.role}\``),
    );
    client.channels.cache.get("822942775703240707").send(
      new Discord.MessageEmbed()
        .setColor("BLUE")
        .setAuthor(
          `Application From: ${
            client.users.cache.get(req.user.id).tag
          }\nQuestion 2: Why we should choose you as a staff member`,
        )
        .setDescription(`\`${req.body.application}\``),
    );
    client.channels.cache.get("822942775703240707").send(
      new Discord.MessageEmbed()
        .setAuthor(
          `Application From: ${
            client.users.cache.get(req.user.id).tag
          }\nQuestion 3: Projects`,
        )
        .setColor("BLUE")
        .setDescription(`\`${req.body.projects}\``),
    );
    alertmsg = "Your Application has been send to the owner!";
    const apsr = await apps.findOne({});
    return renderTemplate(res, req, "apps.ejs", {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
      apps: apsr,
    });
  });
  app.get("/profile", checkAuth, async (req, res) => {
    const users = await USERS.findOne({ userID: req.user.id });
    USERS.findOne({ userID: req.user.id }, (err, res) => {
      if (!res) {
        new USERS({
          userID: req.user.id,
          bio: "Im cool",
          badge: ["Member"],
          nick: "None",
        }).save();
      }
    });
    const badgest = {
      Member: "fa fa-users",
      Developer: "fa fa-code",
      Staff: "fa fa-wrench",
      Partner: "fa fa-handshake-o",
      Donator: "fa fa-diamond",
      Blacklisted: "fa fa-user-times",
    };
    const infractions = await CASES.find({ userID: req.user.id });
    renderTemplate(res, req, "profile.ejs", {
      cases: infractions,
      badgest: badgest,
      profile: users,
      alert: null,
      error: null,
    });
  });
  app.post("/profile", checkAuth, async (req, res) => {
    let users = await USERS.findOne({ userID: req.user.id });
    let alertmsg = "";
    let errormsg = "";
    USERS.findOne({ userID: req.user.id }, async (err, res) => {
      if (!res) {
        await new USERS({
          userID: req.user.id,
          bio: req.body.changebio || "I am a very mysterious person!",
          badge: ["Member"],
          nick: "None",
        }).save();
      }
    });
    const infractions = await CASES.find({ userID: req.user.id });
    if (req.body.changebio) {
      if (req.body.changebio.length > 50) {
        errormsg = "Max length for bio is 50 characters!";
        return renderTemplate(res, req, "profile.ejs", {
          cases: infractions,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      } else if (req.body.changebio.length < 5) {
        errormsg = "Bio can't be less than 10 characters!";
        return renderTemplate(res, req, "profile.ejs", {
          cases: infractions,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      } else if (users) {
        users.bio = req.body.changebio;
        users.nick = req.body.changenick ? req.body.changenick : "None";
        await users.save();
        alertmsg = "Your bio & nickname has been updated successfully!";
        users = await USERS.findOne({ userID: req.user.id });
        return renderTemplate(res, req, "profile.ejs", {
          cases: infractions,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      } else {
        users = await USERS.findOne({ userID: req.user.id });
        alertmsg = "Your bio & nickname has been updated successfully!";
        return renderTemplate(res, req, "profile.ejs", {
          cases: infractions,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      }
    }
    if (req.body.captcha == "i confirm that i want to delete my data") {
      if (req.body.requestdelete) {
        if (!users) {
          errormsg = "You don't have data in our site!";
          return renderTemplate(res, req, "profile.ejs", {
            cases: infractions,
            profile: users,
            alert: alertmsg,
            error: errormsg,
          });
        } else {
          await USERS.findOneAndDelete({ userID: req.user.id });
          alertmsg = "Your data has been deleted!";
          users = await USERS.findOne({ userID: req.user.id });
          return await renderTemplate(res, req, "profile.ejs", {
            cases: infractions,
            profile: users,
            alert: alertmsg,
            error: errormsg,
          });
        }
      }
    } else {
      errormsg = "You didn't complete captcha!";

      return renderTemplate(res, req, "profile.ejs", {
        cases: infractions,
        profile: users,
        alert: alertmsg,
        error: errormsg,
      });
    }
    const badgest = {
      Member: "fa fa-users",
      Developer: "fa fa-code",
      Staff: "fa fa-wrench",
      Partner: "fa fa-handshake-o",
      Donator: "fa fa-diamond",
      Blacklisted: "fa fa-user-times",
    };
    renderTemplate(res, req, "profile.ejs", {
      cases: infractions,
      badgest: badgest,
      profile: users,
      alert: alertmsg,
      error: errormsg,
    });
  });
  app.post("/bug", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    let alertmsg = "";
    let errormsg = "";
    if (ratelimit.has(req.user.id + "bug")) {
      errormsg = "Rate Limit. Come back after 30 seconds";
    } else {
      // We retrive the settings stored for this guild.
      if (req.body.reportbug.length > 1200) {
        errormsg = "Max characters exceeded! (1200 characters)";
      } else if (req.body.reportbug.length < 10) {
        errormsg = "Brief report in more than 10 characters";
      } else {
        ratelimit.add(req.user.id + "bug");
        const newbug = new ERRORS({
          userID: req.user.id,
          bug: req.body.reportbug,
        });
        newbug.save().catch(() => {});
        client.channels.cache.get("743044661211562047").send(
          new Discord.MessageEmbed()
            .setColor("DARK_BLUE")
            .setAuthor("New Bug Report Received!")
            .setFooter(`Send By: ${client.users.cache.get(req.user.id).tag}`)
            .setDescription(req.body.reportbug),
        );
        alertmsg = "Your report has been submited and will be reviewed!";
        setTimeout(() => {
          ratelimit.delete(req.user.id + "bug");
        }, 30e3);
      }
    }
    renderTemplate(res, req, "bug.ejs", {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  app.post("/blacklist", checkAuth, async (req, res) => {
    let alertmsg = "",
      errormsg = "",
      guildA = await guilds_bl.findOne({ GuildID: req.body.guildID }),
      usersA = await users_bl.findOne({ userID: req.body.userID });
    if (req.body.guildID) {
      if (!guildA) {
        (
          await guilds_bl.create({
            GuildID: req.body.guildID,
            Reason: req.body.reasonGuild || "Unknown Reason",
          })
        ).save();
        alertmsg = "Successfully blacklisted the server! Type: Guild / Server";
        client.channels.cache.get("822942756610637824").send(
          new Discord.MessageEmbed()
            .setColor("DARK_RED")
            .setAuthor("New Guild Blacklisted!")
            .setFooter(
              `Blacklisted: ${
                client.guilds.cache.get(req.body.guildID).name
              } (${req.body.guildID})`,
            ),
        );
      } else {
        errormsg = "This guild is already blacklisted";
      }
    }
    if (req.body.userID) {
      if (!usersA) {
        (
          await users_bl.create({
            userID: req.body.userID,
            Reason: req.body.reasonUser || "Unknown Reason",
          })
        ).save();
        client.channels.cache.get("822942756610637824").send(
          new Discord.MessageEmbed()
            .setColor("DARK_RED")
            .setAuthor("New User Blacklisted!")
            .setFooter(
              `Blacklisted: ${client.users.cache.get(req.body.userID).tag} (${
                req.body.userID
              })`,
            ),
        );
      } else {
        errormsg = "This user is already blacklisted";
      }
    }
    if (req.body.RuserID) {
      users_bl.findOneAndDelete(
        { userID: req.body.RuserID },
        async (err, data) => {
          if (!data) {
            alertmsg = "Successfully unblacklisted! Type: User";
          } else {
            errormsg = "Error occured!";
          }
        },
      );
      client.channels.cache.get("822942756610637824").send(
        new Discord.MessageEmbed()
          .setColor("DARK_GREEN")
          .setAuthor("User UnBlacklisted!")
          .setFooter(
            `UnBlacklisted: ${client.users.cache.get(req.body.RuserID).tag} (${
              req.body.RuserID
            })`,
          ),
      );
    }
    if (req.body.RguildID) {
      guilds_bl.findOneAndDelete(
        { GuildID: req.body.RguildID },
        async (err, data) => {
          if (!data) {
            alertmsg = "Successfully blacklisted! Type: Guild";
          } else {
            errormsg = "Error occured!";
          }
        },
      );
      client.channels.cache.get("822942756610637824").send(
        new Discord.MessageEmbed()
          .setColor("DARK_GREEN")
          .setAuthor("Guild UnBlacklisted!")
          .setFooter(
            `UnBlacklisted: ${
              client.guilds.cache.get(req.body.RguildID).name
            } (${req.body.RguildID})`,
          ),
      );
    }
    renderTemplate(res, req, "blacklist.ejs", {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  app.get("/blacklist", async (req, res) => {
    renderTemplate(res, req, "blacklist.ejs", { alert: null, error: null });
  });
  app.post("/suggest", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    let alertmsg = "";
    let errormsg = "";
    // We retrive the settings stored for this guild.
    if (req.body.suggestion.length > 500) {
      errormsg = "Max characters exceeded! (1000 characters)";
    } else if (req.body.suggestion.length < 10) {
      errormsg = "Brief suggestion in more than 10 characters";
    } else {
      const newbug = new suggestions({
        userID: req.user.id,
        suggestion: req.body.suggestion,
      });
      newbug.save().catch(() => {});
      client.channels.cache.get("743044682795450389").send(
        new Discord.MessageEmbed()
          .setColor("DARK_RED")
          .setAuthor("New Suggestion has Landed!")
          .setFooter(`Send By: ${client.users.cache.get(req.user.id).tag}`)
          .setDescription(req.body.suggestion),
      );
      alertmsg = "Your suggestion has been submited to developers!";
    }
    renderTemplate(res, req, "suggest.ejs", {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  // Dashboard endpoint.
  app.get("/dashboard", checkAuth, async (req, res) => {
    // let prems = Discord.Permissions;
    // let s3 = new prems(req.body.guilds)
    // let s = s3.has("MANAGE_GUILD")
    const seerr = await servers.find();
    renderTemplate(res, req, "dashboard.ejs", {
      perms: Discord.Permissions,
      settings: servers,
    });
  });
  app.get("/badge-panel", checkAuth, async (req, res) => {
    const alertmsg = "",
      errormsg = "";
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    renderTemplate(res, req, "badges-panel.ejs", { alert: null, error: null });
  });
  app.post("/badge-panel", checkAuth, async (req, res) => {
    let alertmsg = "",
      errormsg = "";
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    if (req.body.id) {
      if (req.body.reloadcap1 == "2717") {
        // console.log(req.body)
        USERS.findOne({ userID: req.body.id }, async (err, data) => {
          // console.log(res)
          if (!data) {
            const neww = new USERS({
              userID: req.body.id,
              bio: "Yoo im cool and misterious",
              badge: ["Members", req.body.badges1],
            });
            neww.save();
            alertmsg = "Added Badge to user!";
          } else if (data) {
            if (data.badge.includes(req.body.badges1)) {
              errormsg = "This user already has this badge";
            } else {
              data.badge.push(req.body.badges1);
              data.save();
              alertmsg = "Added Badge to user";
              client.channels.cache.get("822942816819740692").send(
                new Discord.MessageEmbed()
                  .setColor("DARK_GREEN")
                  .setTitle("Badge Added!")
                  .setDescription(
                    `**Badge:** ${req.body.badges1}\n\n**Added to :** ${
                      client.users.cache.get(req.body.id).username
                    }#${
                      client.users.cache.get(req.body.id).discriminator
                    }\n**Adder:** ${client.users.cache.get(req.user.id).tag}`,
                  ),
              );
            }
          } else {
            errormsg = "Invalid captcha entered!";
          }
          // data.push({userID: req.body.id, bio: data.bio || "i am a misterios person", })
        });
      }
    } else if (req.body.rid) {
      if (req.body.reloadcap2 == "2717") {
        await USERS.findOne({ userID: req.body.rid }, async (err, data) => {
          const items = data.badge;
          const valueToRemove = req.body.badges2;
          if (!items.includes(req.body.badges2))
            return (errormsg = "This user doesn't have that badge!");
          const i = items.indexOf(valueToRemove);
          items.splice(i, 1);
          data.save();
          // data.badge.pop(req.body.badges1)
          // data.save();
          alertmsg = "Removed badge from the user";
          client.channels.cache.get("822942816819740692").send(
            new Discord.MessageEmbed()
              .setColor("DARK_RED")
              .setTitle("Badge Removed!")
              .setDescription(
                `**Badge:** ${req.body.badges2}\n\n**Removed from:** ${
                  client.users.cache.get(req.body.rid).username
                }#${
                  client.users.cache.get(req.body.rid).discriminator
                }\n**Remover:** ${client.users.cache.get(req.user.id).tag}`,
              ),
          );
        });
      } else {
        errormsg = "Invalid captcha entered!";
      }
    }
    renderTemplate(res, req, "badges-panel.ejs", {
      alert: alert,
      error: errormsg,
    });
  });
  app.get("/premium-panel", checkAuth, async (req, res) => {
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    renderTemplate(res, req, "premium-panel.ejs", { alert: null, error: null });
  });
  app.post("/premium-panel", checkAuth, async (req, res) => {
    let alertmsg = "",
      errormsg = "";
    if (req.body.apremium) {
      if (req.body.reloadcap3 == "2717") {
        const guild = client.guilds.cache.get(req.body.apremium);
        var storedSettings = await GuildSettings.findOne(
          { guildID: req.body.apremium },
          async (err, data) => {
            data.premium = true;
            data.save();
          },
        );
        alertmsg = "Added premium to the guild";
        client.channels.cache.get("825812025867108382").send(
          new Discord.MessageEmbed()
            .setColor("DARK_GREEN")
            .setTitle("Premium Added!")
            .setDescription(
              `**Guild ID:** ${req.body.apremium}\n\n**Added from:** ${
                client.users.cache.get(req.user.id).username
              }#${client.users.cache.get(req.user.id).discriminator}`,
            ),
        );
        const embed = new Discord.MessageEmbed()
          .setColor("DARK_GREEN")
          .setDescription(
            `Hello, This server has been added to premium plan by bot owner (${
              client.users.cache.get("473276250815856650").tag
            })!`,
          );
        client.guilds.cache
          .get(req.body.apremium)
          .channels.cache.random()
          .send(`<@${guild.ownerID}>`, embed);
      } else {
        errormsg = "Invalid captcha entered!";
      }
    } else if (req.body.rpremium) {
      if (req.body.reloadcap4 == "2717") {
        // let guild = client.guilds.cache.get(req.body.apremium)
        console.log(req.body.rpremium);
        var storedSettings = await GuildSettings.findOne(
          { guildID: req.body.rpremium },
          async (err, data) => {
            data.premium = false;
            data.save();
          },
        );
        alertmsg = "Removed premium from the guild";
        client.channels.cache.get("825812025867108382").send(
          new Discord.MessageEmbed()
            .setColor("DARK_RED")
            .setTitle("Premium Removed!")
            .setDescription(
              `**Guild ID:** ${req.body.rpremium}\n\n**Removed from:** ${
                client.users.cache.get(req.user.id).username
              }#${client.users.cache.get(req.user.id).discriminator}`,
            ),
        );
      } else {
        errormsg = "Invalid captcha entered!";
      }
    }
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    renderTemplate(res, req, "premium-panel.ejs", {
      alert: errormsg,
      error: alertmsg,
    });
  });
  app.get("/privacy", (req, res) => {
    renderTemplate(res, req, "privacy.ejs");
  });
  app.get("/commands", (req, res) => {
    renderTemplate(res, req, "commands.ejs");
  });
  // app.get("/404", (req, res) => {
  //     res.status(404).json({ success: false, errorCode: 404, note: "Visit https://discord.gg/zxFvKQ5 if u think this is a bug"})
  //     renderTemplate(res, req, "404.ejs")
  // })
  app.get("/panel", checkAuth, async (req, res) => {
    const u = await USERS.findOne({ userID: req.user.id });
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    const bugres = await ERRORS.find({});
    const sugg = await suggestions.find({});
    bugres.filter((bug) => bug);
    sugg.filter((s) => s);
    renderTemplate(res, req, "panel.ejs", {
      alert: null,
      error: null,
      reportbug: bugres,
      suggestion: sugg,
    });
  });
  app.get("/area-2717", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) return res.status(403);
    renderTemplate(res, req, "area-2717.ejs", { alert: null, error: null });
  });
  app.post("/area-2717", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) {
      res.status(403);
    }
    console.log(req.body);
    if (req.body.code_number) {
      console.log(req.body);
      let text = req.body.code_number;
      text = text
        .replace(/2717/g, "Dara <3 Emil")
        .replace(/985/g, "Its getting bad again....")
        .replace(/404/g, "Not here...")
        .replace(/909/g, "Lets meet?");
      renderTemplate(res, req, "area-2717.ejs", {
        alert: text,
        error: null,
        text: text,
      });
    }
  });
  app.get("/feedback", checkAuth, async (req, res) => {
    renderTemplate(res, req, "feedback.ejs", { alert: null, error: null });
  });
  app.post("/feedback", checkAuth, async (req, res) => {
    let errormsg = "",
      alertmsg = "";
    if (req.body.feedback) {
      const channel = client.channels.cache.get("849958694259392562");
      if (req.body.feedback.length > 3900) {
        errormsg = "Feedback must be under 3900 characters";
      } else {
        const embed = new Discord.MessageEmbed()
          .setAuthor(
            `${req.user.username}#${req.user.discriminator} (${req.user.id})`,
          )
          .setTitle("A Feedback has landed.")
          .setDescription(
            `${req.body.feedback}** - [${req.user.username}#${req.user.discriminator}]**`,
          )
          .setFooter("© AntiRaid 2021 - 2022")
          .setThumbnail(client.user.displayAvatarURL())
          .setColor("DARK_GREEN");
        channel.send(embed);
        alertmsg = "Your feedback has been sent!";
      }
    }
    renderTemplate(res, req, "feedback.ejs", {
      alert: alertmsg,
      error: errormsg,
    });
  });
  app.get("/app-panel", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) return res.status(403);
    renderTemplate(res, req, "application_panel.ejs", {
      alert: null,
      error: null,
    });
  });
  app.post("/app-panel", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) {
      res.status(403);
    }
    console.log(req.body);
    let alertmsg = "",
      errormsg = "";
    if (req.body.status) {
      await apps.findOne({}, async (err, data) => {
        if (err) return console.log(err);
        if (data) {
          data.status = req.body.status;
          data.save();
          alertmsg = `Staff Applications are now: ${req.body.status}!`;
          let color;
          if (req.body.status == "open") {
            color = "GREEN";
          } else if (req.body.status == "closed") {
            color = "RED";
          }
          console.log(req.user);
          const embed = new Discord.MessageEmbed()
            .setAuthor(
              `${req.user.username}#${req.user.discriminator} - (${req.user.id})`,
              client.user.displayAvatarURL(),
            )
            .setColor(color)
            .setDescription(
              `Staff Applications are ${req.body.status}! **Set By:** ${req.user.username}`,
            );
          client.channels.cache
            .get(config.discord.channels.applications)
            .send(embed);
        } else if (!data) {
          new apps({
            status: req.body.status,
          }).save();
          alertmsg = `Staff Applications are now: ${req.body.status}`;
          const embed = new Discord.MessageEmbed()
            .setAuthor(
              `${req.user.username}#${req.user.discriminator} - (${req.user.id})`,
              client.user.displayAvatarURL(),
            )
            .setColor(color)
            .setDescription(
              `Staff Applications are ${req.body.status}! **Set By:** ${req.user.username}`,
            );
          client.channels.cache
            .get(config.discord.channels.applications)
            .send({ embeds: [embed] });
        }
      });
    }
    renderTemplate(res, req, "application_panel.ejs", {
      alert: alertmsg,
      error: errormsg,
    });
  });
  app.get("/dev-panel", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) return res.status(403);
    renderTemplate(res, req, "dev-panel.ejs", { alert: null, error: null });
  });
  app.get("/todo", async (req, res) => {
    const d = await dev.find({});
    renderTemplate(res, req, "todo.ejs", { alert: null, error: null, todo: d });
  });
  app.post("/dev-panel", checkAuth, async (req, res) => {
    if (!config.area2717.includes(req.user.id)) {
      res.status(403);
    }
    let alertmsg = "",
      errormsg = "";
    if (req.body.name) {
      await dev.find({}, async (err, data) => {
        const newdata = new dev({
          name: req.body.name,
          date: req.body.date,
          ID: data.length + 1,
          addedBy: req.user.id,
        });
        newdata.save();
      });
    } else if (req.body.id) {
      await dev.findOneAndDelete({ ID: req.body.id });
      alertmsg = `Successfully removed a to-Do with ID: ${req.body.id} from the To-Do List`;
    }
    renderTemplate(res, req, "dev-panel.ejs", {
      alert: alertmsg,
      error: errormsg,
    });
  });
  // Settings endpoint.
  app.get("/dashboard/:guildID/actions", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    const caseres = await CASES.find(
      { serverID: req.params.guildID },
      { _id: false, auth: false },
    );
    caseres.filter((cases) => cases);
    renderTemplate(res, req, "actions.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      error: null,
      cases: caseres,
    });
  });
  app.get("/dashboard/:guildID/logs", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    renderTemplate(res, req, "logs.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      error: null,
    });
  });
  app.get("/dashboard/:guildID/welcome", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    renderTemplate(res, req, "welcomer.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      error: null,
    });
  });
  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    const cases = await CASES.find(
      { serverID: guild.id },
      { _id: false, auth: false },
    );
    cases.filter((cases) => cases);

    renderTemplate(res, req, "settings.ejs", {
      infractions: cases,
      guild,
      settings: storedSettings,
      alert: null,
    });
  });
  app.get("/user/:userID", checkAuth, async (req, res) => {
    const alertmsg = "",
      errormsg = "";
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const user = USERS.findOne(
      { userID: req.params.userID },
      async (err, data) => {
        if (!data) {
          res.redirect("/");
        }
        const badgest = {
          Member: "fa fa-users",
          Developer: "fa fa-code",
          Staff: "fa fa-wrench",
          Partner: "fa fa-handshake-o",
          Donator: "fa fa-diamond",
          Blacklisted: "fa fa-user-times",
        };
        renderTemplate(res, req, "user.ejs", {
          userconf: data,
          badgest: badgest,
          alert: alertmsg,
          error: errormsg,
        });
      },
    );
    client.logs.visitLogs(
      client.users.cache.get(req.user.id).tag,
      "Profile Visit",
      client.users.cache.get(req.params.userID).tag,
    );
  });
  app.get("/dashboard/:guildID/automod", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    renderTemplate(res, req, "automod.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
    });
  });
  app.get("/dashboard/:guildID/others", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    renderTemplate(res, req, "others.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      error: null,
    });
  });
  app.get("/dashboard/:guildID/roles", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");

    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "v!",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    renderTemplate(res, req, "roles.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      error: null,
    });
  });
  app.post("/dashboard/:guildID/automod", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    // We set the prefix of the server settings to the one that was sent in request from the form.
    if (req.body.antispam) {
      if (req.body.antispam == "Disabled") {
        storedSettings.antispam = "0";
        storedSettings.save().catch(() => {});
      } else {
        storedSettings.antispam = req.body.antispam;
        storedSettings.save().catch(() => {});
      }
    }
    if (req.body.antiraid) {
      if (req.body.antiraid == "Disabled") {
        storedSettings.antiraid = "0";
        storedSettings.save().catch(() => {});
      } else {
        storedSettings.antiraid = req.body.antiraid;
        storedSettings.save().catch(() => {});
      }
    }
    // We save the settings.
    await storedSettings.save().catch(() => {});

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "automod.ejs", {
      guild,
      settings: storedSettings,
      alert: "Success saved changes!",
    });
  });
  app.post("/dashboard/:guildID/roles", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    // We set the prefix of the server settings to the one that was sent in request from the form.
    const errormsg = "";
    const alertmsg = "";
    if (req.body.muterolesettings) {
      if (req.body.muterolesettings == "None") {
      } else if (req.body.muterolesettings == "remove") {
        storedSettings.mutedrole = "String";
        await storedSettings.save().catch(() => {});
      } else {
        storedSettings.mutedrole = req.body.muterolesettings;
        await storedSettings.save().catch(() => {});
      }
    }
    if (req.body.autorole) {
      if (req.body.autorole == "None") {
      } else if (req.body.autorole == "remove") {
        storedSettings.autorole = "String";
        await storedSettings.save().catch(() => {});
      } else {
        storedSettings.autorole = req.body.autorole;
        await storedSettings.save().catch(() => {});
      }
    }
    if (req.body.botautorole) {
      if (req.body.botautorole == "None") {
      } else if (req.body.botautorole == "remove") {
        storedSettings.botautorole = "String";
        await storedSettings.save().catch(() => {});
      } else {
        storedSettings.botautorole = req.body.botautorole;
        await storedSettings.save().catch(() => {});
      }
    }
    // We save the settings.

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "roles.ejs", {
      guild,
      settings: storedSettings,
      alert: "Success saved settings!",
      error: `${errormsg}`,
    });
  });
  app.post("/dashboard/:guildID/logs", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    // We set the prefix of the server settings to the one that was sent in request from the form.
    const errormsg = "";
    let alertmsg = "";
    {
      if (req.body.auditchannel) {
        if (req.body.auditchannel == "None") {
          storedSettings.audit = "String";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.audit = req.body.auditchannel;
          storedSettings.save().catch(() => {});
        }
      }
      if (req.body.modchannel) {
        if (req.body.modchannel == "None") {
          storedSettings.mod = "String";
          storedSettings.save().catch(() => {});
        } else {
          storedSettings.mod = req.body.modchannel;
          storedSettings.save().catch(() => {});
        }
      }
      alertmsg = "Success saved logs!";
    }
    // We save the settings.

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "logs.ejs", {
      guild,
      settings: storedSettings,
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  app.post("/dashboard/:guildID/welcome", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    // We set the prefix of the server settings to the one that was sent in request from the form.
    let errormsg = "";
    let alertmsg = "";
    {
      if (req.body.leavechannel) {
        if (req.body.leavechannel == "None") {
          storedSettings.leave = "String";
        } else {
          storedSettings.leave = req.body.leavechannel;
        }
      }
      if (req.body.welcomechannel) {
        if (req.body.welcomechannel == "None") {
          storedSettings.welcome = "String";
        } else {
          storedSettings.welcome = req.body.welcomechannel;
        }
      }
      if (!req.body.welcomemsg) {
        storedSettings.welcomemsg = "String";
      }
      if (req.body.welcomemsg) {
        if (req.body.welcomemsg.length < 10) {
          errormsg = "Welcome msg can't be less than 10 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else if (req.body.welcomemsg.length > 500) {
          errormsg = "welcome msg can't be more than 500 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          storedSettings.welcomemsg = req.body.welcomemsg;
        }
      }
      if (!req.body.leavemsg) {
        storedSettings.leavemsg = "String";
      }
      if (req.body.leavemsg) {
        if (req.body.leavemsg.length < 10) {
          errormsg = "Leave msg can't be less than 10 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else if (req.body.leavemsg.length > 500) {
          errormsg = "Leave msg can't be more than 500 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          storedSettings.leavemsg = req.body.leavemsg;
        }
      }
      if (!req.body.privatemsg) {
        storedSettings.private = "String";
      }
      if (req.body.privatemsg) {
        if (req.body.privatemsg.length < 10) {
          errormsg = "Private welcome msg can't be less than 10 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else if (req.body.privatemsg.length > 500) {
          errormsg = "Private welcome msg can't be more than 500 letters";
          return renderTemplate(res, req, "welcomer.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          storedSettings.private = req.body.privatemsg;
        }
      }
      if (req.body.typemsg) {
        storedSettings.embedjl = req.body.typemsg;
      }
      alertmsg = "Success saved updates!";
    }
    storedSettings.save();
    // We save the settings.

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "welcomer.ejs", {
      guild,
      settings: storedSettings,
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  app.post("/dashboard/:guildID/others", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }

    // We set the prefix of the server settings to the one that was sent in request from the form.
    let errormsg = "";
    let alertmsg = "";
    {
      if (req.body.prefix) {
        if (req.body.prefix.length < 1) {
          errormsg = "Prefix can't be empty";
          return renderTemplate(res, req, "others.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else if (req.body.prefix.length > 5) {
          errormsg = "Prefix length can't be more than 5 letters!";
          return renderTemplate(res, req, "others.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          storedSettings.prefix = req.body.prefix;
          if (guild.channels.cache.get(storedSettings.mod)) {
            guild.channels.cache
              .get(storedSettings.mod)
              .send(
                `✏️ Server prefix has been changed to \`${req.body.prefix}\``,
              );
          }
          // We save the settings.
          await storedSettings.save().catch(() => {});
        }
      }
      if (req.body.maxwarns) {
        if (req.body.maxwarns.length > 2) {
          errormsg = "Max warns is 99";
          return renderTemplate(res, req, "others.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else if (isNaN(req.body.maxwarns)) {
          errormsg = "Only numbers are allowed at maxwarns";
          return renderTemplate(res, req, "others.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          storedSettings.maxwarns = req.body.maxwarns; // We save the settings.
          await storedSettings.save().catch(() => {});
        }
      }
      if (req.body.nickname) {
        if (req.body.nickname.length > 25) {
          errormsg = "Nickname can't be longer than 25 letter!";
          return renderTemplate(res, req, "others.ejs", {
            guild,
            settings: storedSettings,
            alert: `${alertmsg}`,
            error: `${errormsg}`,
          });
        } else {
          guild.me.setNickname(req.body.nickname);
        }
      }

      alertmsg = "Success saved changes!";
    }

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "others.ejs", {
      guild,
      settings: storedSettings,
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });
  app.post("/panel", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    let alertmsg = "";
    let errormsg = "";
    const u = await USERS.findOne({ userID: req.user.id });
    // if (!guild) return res.redirect("/dashboard");
    if (!config.dev.includes(req.user.id)) return res.redirect("/");
    // We retrive the settings stored for this guild.
    if (req.body.commandreload) {
      if (req.body.reloadcap == "2717") {
        try {
          delete require.cache[
            require.resolve(`../commands/${req.body.commandreload}.js`)
          ]; //
          client.commands.delete(req.body.commandreload);
          const pull = require(`../commands/${req.body.commandreload}.js`);
          client.commands.set(req.body.commandreload, pull);
          alertmsg = `Successfully reloaded ${req.body.commandreload} !`;
          client.channels.cache.get("829046744071143475").send(
            new Discord.MessageEmbed()
              .setColor("DARK_BLUE")
              .setTitle("Command Reloaded!")
              .setDescription(
                `**Command:** ${req.body.commandreload}\n\n**Executor:** ${
                  client.users.cache.get(req.user.id).tag
                }`,
              ),
          );
        } catch (e) {
          errormsg = "Error occured while reloading !";
        }
      } else {
        errormsg = "Invalid captcha entered!";
      }
    } else if (req.body.acceptbug) {
      ERRORS.findOneAndDelete({ userID: req.body.acceptbug }, (err, res) => {
        if (!res) {
          errormsg = "Error occured while accepting bug !";
        } else {
          alertmsg = "Successfully accepted the bug!";
        }
        client.channels.cache.get("822943159486251078").send(
          new Discord.MessageEmbed()
            .setColor("DARK_RED")
            .setTitle("Bug Accepted!")
            .setDescription(
              `**Bug:** ${res.bug}\n\n**Bug Reporter:** ${
                client.users.cache.get(res.userID).username
              }#${
                client.users.cache.get(res.userID).discriminator
              }\n**Accepter:** ${client.users.cache.get(req.user.id).tag}`,
            ),
        );
      });
    } else if (req.body.acceptsuggestion) {
      suggestions.findOneAndDelete(
        { userID: req.body.acceptsuggestion },
        (err, res) => {
          if (!res) {
            errormsg = "An Error occured while accepting suggestion!";
          } else {
            alertmsg = "Successfully accepted suggestion!";
          }
          client.channels.cache.get("822943121293705226").send(
            new Discord.MessageEmbed()
              .setColor("DARK_GREEN")
              .setTitle("Suggestion Accepted!")
              .setDescription(
                `**Suggestion:** ${res.suggestion}\n\n**Suggestion By:** ${
                  client.users.cache.get(res.userID).username
                }#${
                  client.users.cache.get(res.userID).discriminator
                }\n**Accepter:** ${client.users.cache.get(req.user.id).tag}`,
              ),
          );
        },
      );
    }
    const bugres = await ERRORS.find({}, { _id: false, auth: false });
    bugres.filter((bug) => bug);
    const sugg = await suggestions.find({}, { _id: false, auth: false });
    sugg.filter((s) => s);

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "panel.ejs", {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
      reportbug: bugres,
      suggestion: sugg,
    });
  });
  app.post("/dashboard/:guildID/actions", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }
    // We retrive the settings stored for this guild.
    let alertmsg = "";
    let errormsg = "";
    if (req.body.deletecase) {
      CASES.findOneAndDelete(
        {
          serverID: req.params.guildID,
          case: req.body.deletecase,
        },
        (err, res) => {
          if (!res) {
            errormsg = "Error occured while deleting case !";
          } else {
            if (guild.channels.cache.get(storedSettings.mod)) {
              guild.channels.cache
                .get(storedSettings.mod)
                .send(
                  `🗑️ Case number \`#${req.body.deletecase}\` has been deleted!`,
                );
            }
            alertmsg = `Successfuly deleted case number ${req.body.deletecase}!`;
          }
        },
      );
    }

    const caseres = await CASES.find(
      { serverID: req.params.guildID },
      { _id: false, auth: false },
    );
    caseres.filter((cases) => cases);

    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "actions.ejs", {
      guild,
      settings: storedSettings,
      alert: `${alertmsg}`,
      error: `${errormsg}`,
      cases: caseres,
    });
  });
  // Settings endpoint.
  app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD"))
      return res.redirect("/dashboard");
    // We retrive the settings stored for this guild.
    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      // If there are no settings stored for this guild, we create them and try to retrive them again.
      const newSettings = new GuildSettings({
        antispam: "0",
        maxwarns: "3",
        guildID: guild.id,
        mutedrole: "String",
        prefix: "a.",
        welcome: "String",
        leave: "String",
        audit: "String",
        autorole: "String",
        antiraid: "0",
        welcomemsg: "String",
        leavemsg: "String",
        private: "String",
        botautorole: "String",
        premium: false,
        embedjl: "String",
      });
      await newSettings.save().catch(() => {});
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }

    // We set the prefix of the server settings to the one that was sent in request from the form.
    // We save the settings.
    await storedSettings.save().catch(() => {});
    if (req.body.leaveserver) {
      client.guilds.cache.get(req.body.leaveserver).leave();
      return res.redirect("/");
    }
    const cases = await CASES.find(
      { serverID: guild.id },
      { _id: false, auth: false },
    );
    cases.filter((cases) => cases);
    // We render the template with an alert text which confirms that settings have been saved.
    renderTemplate(res, req, "settings.ejs", {
      infractions: cases,
      guild,
      settings: storedSettings,
      alert: "Success kicked the bot",
      error: null,
    });
  });
  app.use(function (req, res) {
    res.status(404);
    renderTemplate(res, req, "404.ejs");
  });
  app.use(function (req, res) {
    res.status(403);
    renderTemplate(res, req, "403.ejs");
  });
  app.use(async function (req, res) {
    res.status(878);
    const u = await users_bl.findOne({ userID: req.user.id });
    if (u) {
      renderTemplate(res, req, "blockBlacklisted.ejs", {
        alert: null,
        error: null,
        u: u,
      });
    }
  });
  app.listen(config.port, null, null, () => client.logs.dashReady("Website"));
};
