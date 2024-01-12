const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const caseSchema = mongoose.Schema(
  {
    caseId: reqString,
    targetId: reqString,
    reason: String,
    type: reqString,
    serverId: reqString,
    modId: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("cases", caseSchema);
