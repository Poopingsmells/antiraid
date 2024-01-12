const mongoose = require("mongoose");

const serverusers = mongoose.Schema({
  name: String,
  date: String,
  ID: Number,
  addedBy: String,
});

module.exports = mongoose.model("dev", serverusers);
