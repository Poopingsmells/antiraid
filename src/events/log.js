// eslint-disable-next-line no-unused-vars
const { MessageActionRow, Guild } = require("discord.js");
const servers = require("../models/servers");
const AntiEmbed = require("../Functions/AntiEmbed");

const actions = {
  1: {
    desc: (options = {}) => {
      return `${options.give ? "Gave" : "Removed"} the ${options.role} role ${
        options.give ? "to" : "from"
      } ${options.memberCount} member${options.memberCount == 1 ? "" : "s"}`;
    },
    title: "Mass role give / remove",
    log: "ar",
  },
  2: {
    desc: () => {
      return "To view more info about a modeartion case, use the `coming soon` command";
    },
    title: "New moderation case",
    log: "modlogs",
  },
};

module.exports = {
  name: "log",
  /**
   * @param {Guild} guild
   * @param {Object} action
   * @param {Object} [action.descriptionData]
   * @param {Number} action.id
   * @param {Array} action.fieldsData
   * @param {MessageActionRow} action.row
   */
  run: async (guild, action = {}) => {
    let serverData = await servers.findOne({ guildID: guild.id });
    if (!serverData) serverData = await servers.findOne({ guildID: guild.id });

    if (!serverData) return;
    if (!serverData[actions[action.id].log]) return;
    const channel = guild.channels.cache.get(
      serverData[actions[action.id].log],
    );
    if (!channel) return;

    const embed = new AntiEmbed()
      .setTitle(actions[action.id].title)
      .setDescription(actions[action.id].description(action.descriptionData))
      .setAuthor({
        name: "AntiRaid Logging",
        iconURL: guild.client.displayAvatarURL(),
        url: "https://antiraid.xyz",
      })
      .setTimestamp();

    if (action.fieldsData) {
      for (const fieldData of action.fieldsData) {
        embed.addField(fieldData.name, fieldData.value);
      }
    }

    if (action.row) {
      channel.send({ embeds: [embed], components: [action.row] });
    } else {
      channel.send({ embeds: [embed] });
    }
  },
};
