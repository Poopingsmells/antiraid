module.exports = (req, res, next) => {
  const guild = req.bot.guilds.cache.get(req.bot.config.main_guild.id);
  if (req.isAuthenticated() || req.user) {
    const roles = guild.members.cache
      .get(req.user.id)
      ?.roles.cache.get(req.bot.config.main_guild.roles.dev);
    if (!roles) {
      res.redirect("/403");
    } else {
      next();
    }
  } else {
    res.sendStatus(303);
  }
};
