const { Router } = require("express");
const CheckAuth = require("../middlewares/auth");
const badges = require("../../Functions/Badges");
const cases = require("../../models/cases");
const blacklist = require("../../models/user_blacklist");
const user = require("../../models/users");

module.exports.Router = class Profile extends Router {
  constructor() {
    super();
    this.get("/", CheckAuth, async function (req, res) {
      const user1 = await req.bot.users.fetch(req.user.id);
      const user2 = await user.findOne({ userID: req.user.id });
      if (!user2) {
        let data = new user({
          userID: req.user.id,
          bio: "Not set.",
        });
        data.save();
      }
      let flags = user1.flags;
      let flags2 = flags.toArray();
      const casesdata = await cases.find({ targetId: req.user.id });
      const blacklist2 = await blacklist.findOne({ userID: req.user.id });
      let str2;
      if (!blacklist2) {
        str2 = "No";
      } else {
        str2 = "Yes";
      }
      res.status(200).render("profile", {
        bot: req.bot,
        user: req.user,
        badges_check: badges,
        flags: flags2,
        userr: user2,
        cases: casesdata,
        blacklist: str2,
        is_logged: Boolean(req.session.passport?.user),
        guilds: req.user.guilds.filter(
          (u) => (u.permissions & 2146958591) === 2146958591,
        ),
        avatarURL: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp`,
        iconURL: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp?size=32`,
      });
    });
    this.get("/raw", CheckAuth, async function (req, res) {
      const user1 = await user.findOne(
        { userID: req.user.id },
        { _id: 0, __v: 0 },
      );
      const obj = req.user;
      const obj2 = Object.fromEntries(
        Object.entries(obj).filter(([key]) => !key.includes("guilds")),
      );
      res
        .status(200)
        .send({ Provided_By_Discord: obj2, Provided_By_Our_DB: user1 });
    });
    this.get("/edit", CheckAuth, function (req, res) {
      let alertmsg, errormsg;
      res.render("edit-profile", {
        bot: req.bot,
        user: req.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
    this.post("/edit", CheckAuth, async function (req, res) {
      let alertmsg, errormsg;
      const data = await user.findOne({ userID: req.user.id });
      if (!data) {
        new user({ userID: req.user.id, bio: req.body.bio }).save();
        alertmsg = "Profile updated!";
      } else {
        if (req.body.bio) {
          if (req.body.bio.length > 500) {
            errormsg = "Bio is too long!";
          } else {
            data.bio = req.body.bio;
            data.save();
            alertmsg = "Bio updated!";
          }
        }
        if (req.body.confirm) {
          await user.findOneAndDelete({ userID: req.user.id });
          alertmsg = "All your data has been deleted!";
        }
      }
      res.render("edit-profile", {
        bot: req.bot,
        user: req.user,
        alert: alertmsg,
        error: errormsg,
      });
    });
  }
};

module.exports.name = "/profile";
