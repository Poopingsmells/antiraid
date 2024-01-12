const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "channelPinsUpdate",
  run: (channel) => {
    if (channel.guild) {
      servers.findOne({ guildID: channel.guild.id }, (err, res) => {
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
                "``" +
                " channel pinned messages has been updated!",
            );
          channel.client.guilds.cache
            .get(channel.guild.id)
            .channels.cache.get(res?.audit)
            .send(embed);
        }
      });
    }
  },
};
