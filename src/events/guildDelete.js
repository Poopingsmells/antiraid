const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "guildDelete",
  run: (client, guild) => {
    servers.findOneAndDelete({
      guildID: guild.id,
    });
    const embed = new MessageEmbed()
      .setTitle(`Left Guild | ${guild.name} (${guild.id})`)
      .setColor("RED");
    client.guilds?.cache
      .get("822794927754706975")
      .channels?.cache.get("822795982521237604")
      .send({ embeds: [embed] });
  },
};
