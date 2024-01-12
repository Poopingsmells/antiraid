const mongoose = require("mongoose");

const moneySchema = mongoose.Schema({
  protocol_1: Boolean,
  protocol_2: Boolean,
  protocol_3: Boolean,
});

module.exports = mongoose.model("protocols", moneySchema);
