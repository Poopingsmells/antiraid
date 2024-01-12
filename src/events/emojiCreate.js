const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "emojiCreate",
  run: (emoji) => {
    if (emoji.guild) {
      servers.findOne({ guildID: emoji.guild.id }, (err, res) => {
        if (res && res?.audit !== "String") {
          if (
            !emoji.client.guilds.cache
              .get(emoji.guild.id)
              .channels.cache.get(res?.audit)
          )
            return;
          const embed = new MessageEmbed()
            .setDescription(
              "✏️ ``" +
                emoji.name +
                "``" +
                ` (${emoji})` +
                " emoji has been created!",
            )
            .setColor("GREEN");
          emoji.client.guilds.cache
            .get(emoji.guild.id)
            .channels.cache.get(res?.audit)
            .send({ embeds: [embed] });
        }
      });
    }
  },
};
