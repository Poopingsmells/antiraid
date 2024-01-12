const { Router } = require("express");
const auth = require("../middlewares/auth");
const Discord = require("discord.js");
const users_bl = require("../../models/user_blacklist");
const guilds_bl = require("../../models/guild_blacklist");

module.exports.Router = class Staff extends Router {
  constructor() {
    super();
    this.get("/panel", auth, function (req, res) {
      // console.log(req.session);
      let errormsg, alertmsg;
      res.status(200).render("panelBlacklist", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/panel", auth, async (req, res) => {
      let errormsg, alertmsg;
      const guildA = await guilds_bl.findOne({ GuildID: req.body.guildID }),
        usersA = await users_bl.findOne({ userID: req.body.userID });
      if (req.body.guildID) {
        if (!guildA) {
          (
            await guilds_bl.create({
              GuildID: req.body.guildID,
              Reason: req.body.reasonGuild || "Unknown Reason",
            })
          ).save();
          alertmsg =
            "Successfully blacklisted the server! Type: Guild / Server";
          req.bot.channels.cache.get("822942756610637824").send({
            embeds: [
              new Discord.MessageEmbed()
                .setColor("DARK_RED")
                .setTitle("New Guild Blacklisted!")
                .setFooter(
                  `Blacklisted: ${
                    req.bot.guilds.cache.get(req.body.guildID).name
                  } (${req.body.guildID})`,
                ),
            ],
          });
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
          req.bot.channels.cache.get("822942756610637824").send({
            embeds: [
              new Discord.MessageEmbed()
                .setColor("DARK_RED")
                .setTitle("New User Blacklisted!")
                .setFooter(
                  `Blacklisted: ${
                    req.bot.users.cache.get(req.body.userID).tag
                  } (${req.body.userID})`,
                ),
            ],
          });
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
        req.bot.channels.cache.get("822942756610637824").send({
          embeds: [
            new Discord.MessageEmbed()
              .setColor("DARK_GREEN")
              .setTitle("User UnBlacklisted!")
              .setFooter(
                `UnBlacklisted: ${
                  req.bot.users.cache.get(req.body.RuserID).tag
                } (${req.body.RuserID})`,
              ),
          ],
        });
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
        req.bot.channels.cache.get("822942756610637824").send({
          embeds: [
            new Discord.MessageEmbed()
              .setColor("DARK_GREEN")
              .setTitle("Guild UnBlacklisted!")
              .setFooter(
                `UnBlacklisted: ${
                  req.bot.guilds.cache.get(req.body.RguildID).name
                } (${req.body.RguildID})`,
              ),
          ],
        });
      }
      res.status(201).render("panelBlacklist", {
        bot: req.bot,
        config: req.config,
        user: req.session.passport?.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.get("/view", auth, async (req, res) => {
      const guildss = await guilds_bl.find({}),
        userss = await users_bl.find({});
      if (
        req.bot.config.dev.includes(req.user.id) ||
        req.bot.config.staff.includes(req.user.id)
      ) {
        res.status(200).render("viewBlacklisted", {
          bot: req.bot,
          config: req.config,
          user: req.session.passport?.user,
          bl_guilds: guildss,
          bl_users: userss,
        });
      } else {
        res.status(403).send({ error: "Fobridden." });
      }
    });
  }
};

module.exports.name = "/blacklist";
