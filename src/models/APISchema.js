const mongoose = require("mongoose");

const schema = mongoose.Schema({
  guilds: String,
  users: String,
  dbconnection: String,
  uptime: String,
});

module.exports = mongoose.model("api", schema);
