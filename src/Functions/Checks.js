const servers = require("../models/servers");

class Checkers {
  CheckPremium(GuildID) {
    const access = servers.findOne({ guildID: GuildID });
    if (access.premium == false) {
      return "This Server doesn't have premium!";
    } else {
      return "This Server does have premium!";
    }
  }
}

module.exports = Checkers;
