const mongoose = require("mongoose");

module.exports = mongoose.model(
  "guild_blacklist",
  new mongoose.Schema({
    guildID: String,
    reason: String,
  }),
);
