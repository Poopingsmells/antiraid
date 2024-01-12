const timeEvents = require("../models/timeEvents");

module.exports = async (client) => {
  const events = await timeEvents.find({});

  if (events.length == 0) return;

  for (const event of events) {
    if (new Date() >= new Date(event.time)) {
      // eslint-disable-next-line no-unused-vars
      const guild = await client.guilds.cache.get(event.guildId);
      switch (event.type) {
        case "unmute":
          // unmute here
          break;

        default:
          // an error occured
          break;
      }
    }

    events.splice(events.indexOf(event), 1);
  }
};
