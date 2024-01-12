const mongoose = require("mongoose");

const moneySchema = mongoose.Schema({
  userID: String,
  suggestion: String,
});

module.exports = mongoose.model("suggestions", moneySchema);
