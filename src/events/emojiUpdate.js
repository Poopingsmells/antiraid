const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "emojiUpdate",
  run: (oldEmoji, newEmoji) => {
    if (newEmoji.guild) {
      servers.findOne(
        {
          guildID: newEmoji.guild.id,
        },
        (err, res) => {
          if (res && res?.audit == "String") {
            if (
              !newEmoji.client.guilds.cache
                .get(newEmoji.guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            if (oldEmoji.name !== newEmoji.name) {
              const embed = new MessageEmbed()
                .setAuthor({ name: "✏️ Emoji name update | " + newEmoji.name })
                .setDescription(
                  `Old: **${oldEmoji.name}**\nNew: **${newEmoji.name}**`,
                )
                .setColor("GREEN")
                .setFooter({
                  text: moment(newEmoji.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              newEmoji.client.guilds.cache
                .get(newEmoji.guild.id)
                .channels.cache.get(res?.audit)
                .send({ embeds: [embed] });
            }
          }
        },
      );
    }
  },
};
