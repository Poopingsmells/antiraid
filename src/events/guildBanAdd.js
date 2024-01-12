const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "guildBanAdd",
  run: (guild, member) => {
    if (guild) {
      servers.findOne(
        {
          guildID: guild.id,
        },
        (err, res) => {
          if (res && res?.audit !== "String") {
            if (
              !guild.client.guilds.cache
                .get(guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            const embed = new MessageEmbed()
              .setTitle("🔨 | Member Banned")
              .setDescription(
                stripIndents`
            **${member.tag}** has been banned from this server!

            **ID** - \`${member.id}\`
            `,
              )
              .setColor("RED");
            guild.client.guilds.cache
              .get(guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
        },
      );
    }
  },
};
