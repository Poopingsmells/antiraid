const botsettings = require("../../models/protocols");
module.exports.check = (req, res, next) => {
  const data = botsettings.findOne();
  if (data.protocol_1) {
    if (req.session.passport.user || req.isAuthenticated()) {
      const check = req.bot.config.dev.includes(req.user.id);
      if (check) {
        next();
      } else {
        res.redirect("/maintenance");
      }
    } else {
      res.redirect("/auth/login");
    }
  } else {
    next();
  }
};
