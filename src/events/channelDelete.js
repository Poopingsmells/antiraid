const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "channelDelete",
  run: (channel) => {
    if (channel.guild) {
      servers.findOne(
        {
          guildID: channel.guild.id,
        },
        (err, res) => {
          if (res && res?.audit !== "String") {
            if (
              !channel.client.guilds.cache
                .get(channel.guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            const embed = new MessageEmbed()
              .setDescription(
                "🗑️ ``" +
                  channel.name +
                  "`` channel has been deleted!\nChannel Type: ``" +
                  channel.type +
                  "``",
              )
              .setColor("GREEN");
            channel.client.guilds.cache
              .get(channel.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
        },
      );
    }
  },
};
