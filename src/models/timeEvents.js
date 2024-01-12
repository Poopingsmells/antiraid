const { Schema, model } = require("mongoose");

const timeEventSchema = Schema({
  userId: String,
  guildId: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  time: String,
});

module.exports = model("timeEvents", timeEventSchema);
