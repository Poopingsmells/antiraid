const mongoose = require("mongoose");

module.exports = mongoose.model(
  "user_blacklist",
  new mongoose.Schema({
    userID: String,
    Reason: String,
  }),
);
