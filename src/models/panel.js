const mongoose = require("mongoose");

const panel_access = mongoose.Schema({
  userID: String,
  has_panel_access: Boolean,
});

module.exports = mongoose.model("panel_access", panel_access);
