const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
  name: "guildBanRemove",
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
              .setTitle("🗑️ | Member Unbanned")
              .setDescription(
                stripIndents`
            **${member.tag}** has been unbanned from this server!

            **ID** - \`${member.id}\`
            `,
              )
              .setColor("GREEN");
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
