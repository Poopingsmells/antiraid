const mongoose = require("mongoose");

const serverusers = mongoose.Schema({
  status: String,
});

module.exports = mongoose.model("applications", serverusers);
