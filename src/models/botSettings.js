const { model, Schema } = require("mongoose");

const boolWithDefault = {
  type: Boolean,
  deafult: false,
};

module.exports = new model(
  "botSettings",
  new Schema({
    protocol_1: boolWithDefault,
    protocol_2: boolWithDefault,
    protocol_3: boolWithDefault,
    commands_used_total: Number,
  }),
);
