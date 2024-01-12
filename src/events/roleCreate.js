const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "roleCreate",
  run: (role, client) => {
    if (role.guild) {
      servers.findOne(
        {
          guildID: role.guild.id,
        },
        (err, res) => {
          if (res?.audit !== "String") {
            if (
              !client.guilds.cache
                .get(role.guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            const embed = new MessageEmbed()
              .setDescription("🎉 ``" + role.name + "``" + " role is created!")
              .setColor("GREEN");
            client.guilds.cache
              .get(role.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
        },
      );
    }
  },
};
