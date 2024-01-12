const { MessageEmbed } = require("discord.js");
const servers = require("../models/servers.js");
const moment = require("moment");
const { roleMention } = require("@discordjs/builders");

module.exports = {
  name: "roleUpdate",
  run: async (oldRole, newRole, client) => {
    if (newRole.guild) {
      servers.findOne(
        {
          guildID: newRole.guild.id,
        },
        async (err, res) => {
          if (res && res?.audit !== "String") {
            if (
              !client.guilds.cache
                .get(newRole.guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            if (oldRole.name !== newRole.name) {
              const embed = new MessageEmbed()
                .setTitle("✏️ Role Name Updated | " + newRole.name)
                .setColor("GREEN")
                .setDescription(
                  `Role name changed from **${oldRole.name}** to **${newRole.name}**`,
                )
                .setFooter({
                  text: moment(newRole.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              client.guilds.cache
                .get(newRole.guild.id)
                .channels.cache.get(res?.audit)
                .send({ embeds: [embed] });
            }
            if (oldRole.hexColor !== newRole.hexColor) {
              const embed = new MessageEmbed()
                .setTitle("✏️ Role Color Updated | " + newRole.name)
                .setColor("GREEN")
                .setDescription(
                  `Role color changed from **${oldRole.hexColor}** to **${newRole.hexColor}**`,
                )
                .setFooter({
                  text: moment(newRole.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              client.guilds.cache
                .get(newRole.guild.id)
                .channels.cache.get(res?.audit)
                .send({ embeds: [embed] });
            }
          }
        },
      );
    }
  },
};
