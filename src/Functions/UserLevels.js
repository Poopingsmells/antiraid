const levelSchema = require("../models/member");

const checkLevel = async (member) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    await levelSchema
      .findOne({ guild: member.guild, user: member.user.id })
      .then((data) => resolve(data.permitLevel))
      .catch((error) => reject(error));
  });
};

module.exports = {
  checkLevel,
};
