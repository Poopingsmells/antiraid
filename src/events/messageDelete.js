const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "messageDelete",
  run: (message, client) => {
    client.snipes.set(message.channel.id, {
      content: message.content,
      author: message.author.id,
      time: moment(message.createdAt).format("YYYY-MM-DD HH:mm:ss A"),
      image: message.attachments.first()
        ? message.attachments.first().proxyURL
        : null,
    });

    servers.findOne(
      {
        guildID: message.guild.id,
      },
      (err, res) => {
        if (res?.audit !== "String") {
          if (
            !client.guilds.cache
              .get(message.guild.id)
              .channels.cache.get(res?.audit)
          )
            return;
          if (message.content) {
            const embed = new MessageEmbed()
              .setTitle(`🗑️ Message Deleted | ${message.author.tag}`)
              .setDescription(`Deleted at ${message.channel}`)
              .addField("Content", message.content)
              .setColor("GREEN")
              .setFooter({
                text: `× ${moment(message.createdAt)
                  .format("MM/DD/YYYY HH:mm:ss A")
                  .toString()}`,
              });
            if (message.author.bot) return;
            client.guilds.cache
              .get(message.guild.id)
              .channels.cache.get(res?.audit)
              .send({ embeds: [embed] });
          }
        }
      },
    );
  },
};
