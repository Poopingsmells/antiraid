/* eslint-disable no-inline-comments */
const mongoose = require("mongoose");

const reqString = {
  required: true,
  type: String,
};

const theservers = mongoose.Schema({
  guildID: String,
  // channels
  welcomeChannel: String,
  leaveChannel: String,
  mod: String,
  audit: String,
  CanLockChannels: Array,
  // roles
  mutedrole: String,
  botautorole: String,
  autorole: String,
  // important settings
  premium: Boolean,
  prefix: String,
  key: String,
  highestCaseId: Number,
  // auto-mod settings
  antispam: Number, // 0: no antispam, 1: basic, 2: moderate, 3: severe
  moderateLinks: Boolean,
  moderateProfanity: Boolean,
  moderateWebhooks: Boolean,
  warnsForKick: Number,
  warnsForBan: Number,
  warnsForMute: Number,
  // saved messages
  welcomeMsg: String,
  leaveMsg: String,
  EmbedsForJoinLeave: String,
  AntiRaid: String,
});

module.exports = mongoose.model("guilds", theservers);
