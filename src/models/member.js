const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const members = mongoose.Schema({
  guild: reqString,
  permitLevel: Number,
  user: reqString,
  muted: Boolean,
  activeWarns: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("guild_members", members);
