const mongoose = require("mongoose");

const serverusers = mongoose.Schema({
  ReporterID: String,
  ReportReason: String,
  ReportedUserID: String,
});

module.exports = mongoose.model("guild_reports", serverusers);
