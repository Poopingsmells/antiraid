const mongoose = require("mongoose");

const bot_stats = mongoose.Schema({
  commands_used_total: Number,
});

module.exports = mongoose.model("bot_stats", bot_stats);
