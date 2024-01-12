const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "messageUpdate",
  run: (oldMessage, newMessage, client) => {
    if (newMessage.guild) {
      servers.findOne(
        {
          guildID: newMessage.guild.id,
        },
        (err, res) => {
          if (res?.audit !== "String") {
            client.esnipes.set(newMessage.channel.id, {
              old: oldMessage.content,
              new: newMessage.content,
              author: newMessage.author.id,
              created: moment(newMessage.createdAt).format(
                "MM/DD/YYYY HH:mm:ss A",
              ),
            });
            if (
              !client.guilds.cache
                .get(newMessage.guild.id)
                .channels.cache.get(res?.audit)
            )
              return;
            if (newMessage.content !== oldMessage.content) {
              const embed = new MessageEmbed()
                .setAuthor({
                  name: `✏️ Message edited by ${newMessage.author.tag}`,
                  iconURL: newMessage.author.displayAvatarURL({
                    dynamic: true,
                  }),
                })
                .setColor("GREEN");
              embed.addField("Old Message", oldMessage.content);
              embed.addField("New Message", newMessage.content);
              embed.addField(
                "Link to message",
                `[Jump to message](${newMessage.url})`,
                true,
              );
              embed
                .addField("Edited at", newMessage.channel.name, true)
                .setFooter({
                  text: moment(newMessage.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              if (newMessage.author.bot) return;
              client.guilds.cache
                ?.get(newMessage.guild.id)
                .channels.cache?.get(res?.audit)
                .send({ embeds: [embed] });
            }
          }
        },
      );
    }
  },
};
