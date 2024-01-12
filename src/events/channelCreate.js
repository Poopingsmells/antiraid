const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "channelCreate",
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
              .setColor("GREEN")
              .setDescription(
                "✏️ ``" +
                  channel.name +
                  "`` channel is created\nChannel Type: ``" +
                  channel.type +
                  "``",
              );
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
