const { model, Schema } = require("mongoose");

const backups = new Schema({
  BackupData: Object,
  BackupId: String,
  BackupGuildId: String,
});

module.exports = model("backups", backups);
