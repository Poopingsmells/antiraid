const { MessageEmbed } = require("discord.js");
const servers = require("../models/servers.js");
const moment = require("moment");

module.exports = {
  name: "channelUpdate",
  run: (oldChannel, newChannel) => {
    if (newChannel.guild) {
      servers.findOne({ guildID: newChannel.guild.id }, (err, res) => {
        if (res && res?.audit !== "String") {
          if (
            !newChannel.client.guilds.cache
              .get(newChannel.guild.id)
              .channels.cache.get(res?.audit)
          )
            return;
          if (newChannel.name !== oldChannel.name) {
            const embed = new MessageEmbed()
              .setAuthor({
                name: "✏️ Channel Name Updated",
                iconURL: newChannel.guild.iconURL(),
              })
              .setColor("GREEN")
              .setDescription(
                `Channel name changed from\n **${oldChannel.name}** to **${newChannel.name}**\nChannel Type: **${newChannel.type}**`,
              )
              .setFooter({
                text: moment(newChannel.createdAt)
                  .format("MM/DD/YYYY HH:mm:ss A")
                  .toString(),
              });
            newChannel.client.guilds.cache
              .get(newChannel.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
          if (newChannel.parent !== oldChannel.parent) {
            let oldcate = oldChannel.parent;
            let newcate = newChannel.parent;
            if (oldcate == null) oldcate = "No category!";
            if (newcate == null) newcate = "No category!";
            const embed = new MessageEmbed()
              .setAuthor({
                name: "✏️ Channel Category Updated | " + newChannel.name,
                iconURL: newChannel.guild.iconURL(),
              })
              .setColor("GREEN")
              .setDescription(
                `Channel category changed from\n **${oldcate}** to **${newcate}**`,
              )
              .setFooter({
                text: moment(newChannel.createdAt)
                  .format("MM/DD/YYYY HH:mm:ss A")
                  .toString(),
              });
            newChannel.client.guilds.cache
              .get(newChannel.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
          if (newChannel.type !== oldChannel.type) {
            const embed = new MessageEmbed()
              .setAuthor({
                name: "✏️ Channel Type Updated | " + newChannel.name,
                iconURL: newChannel.guild.iconURL({ dynamic: true }),
              })
              .setColor("GREEN")
              .setDescription(
                `Channel type changed from\n **${oldChannel.type}** to **${newChannel.type}**`,
              )
              .setFooter({
                text: moment(newChannel.createdAt)
                  .format("MM/DD/YYYY HH:mm:ss A")
                  .toString(),
              });
            newChannel.client.guilds.cache
              .get(newChannel.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
        }
      });
    }
  },
};
