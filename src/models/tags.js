const mongoose = require("mongoose");

const moneySchema = mongoose.Schema({
  GuildID: String,
  Command: String,
  Content: String,
});

module.exports = mongoose.model("tags", moneySchema);
