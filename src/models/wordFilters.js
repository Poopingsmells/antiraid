const mongoose = require("mongoose");

const moneySchema = mongoose.Schema({
  guildID: String,
  Words: Array,
});

module.exports = mongoose.model("word-filters", moneySchema);
