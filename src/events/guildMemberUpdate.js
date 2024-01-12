const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "guildMemberUpdate",
  run: async (oldMember, newMember, client) => {
    const guild = newMember.guild;
    if (guild) {
      servers.findOne(
        {
          guildID: newMember.guild.id,
        },
        async (err, res) => {
          if (res?.audit !== "String") {
            if (
              !client.guilds.cache.get(guild.id).channels.cache.get(res?.audit)
            )
              return;
            if (newMember.nickname !== oldMember.nickname) {
              let oldnick = oldMember.nickname;
              let newnick = newMember.nickname;
              if (newnick == null) {
                newnick = newMember.user.username;
              } else if (oldnick == null) {
                oldnick = newMember.user.username;
              }
              const embed = new MessageEmbed()
                .setAuthor({
                  name: "🏷️ Nickname Update | " + newMember.user.username,
                  url: newMember.user.displayAvatarURL({ dynamic: true }),
                })
                .addField("Old nickname", oldnick)
                .addField("New nickname", newnick)
                .setColor("GREEN")
                .setFooter({
                  text: moment(oldMember.user.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              client.guilds.cache
                .get(guild.id)
                .channels.cache.get(res?.audit)
                .send({ embeds: [embed] });
            } else if (newMember.user.avatar !== oldMember.user.avatar) {
              const embed2 = new MessageEmbed()
                .setAuthor({
                  name: "🏷️ Avatar Update | " + newMember.user.username,
                  url: newMember.guild.iconURL(),
                })
                .setColor("GREEN")
                .setImage(newMember.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                  text: moment(oldMember.user.createdAt)
                    .format("MM/DD/YYYY HH:mm:ss A")
                    .toString(),
                });
              client.guilds.cache
                .get(guild.id)
                .channels.cache.get(res?.audit)
                .send({ embeds: [embed2] });
            }
            // if(newMember.roles !== oldMember.roles) {
            //     console.log(oldMember.roles)
            //     console.log(newMember.roles)
            //     let newroles = newMember.roles.cache.filter(r => r.id !== oldMember.roles)
            //     let embed = new MessageEmbed()
            //     .setAuthor("🏷️ Before Role Update | " + newMember.user.username, newMember.guild.iconURL())
            //     .setColor("GREEN")
            //     .setDescription(`- ${newMember.guild.roles.cache.get(oldMember.roles[oldMember.roles.length - 1]).name}`)
            //     .setFooter(moment(oldMember.user.createdAt).format('MM/DD/YYYY HH:mm:ss A'))
            //         client.guilds.cache.get(guild.id).channels.cache.get(res.audit).send(embed)

            //     let embed2 = new MessageEmbed()
            //     .setAuthor("🏷️ After Role Update | " + newMember.user.username, newMember.guild.iconURL())
            //     .setColor("GREEN")
            //     .setDescription(`+ ${newMember.guild.roles.cache.get(oldMember.roles[oldMember.roles.length - 1]).name}`)
            //     .setFooter(moment(oldMember.user.createdAt).format('MM/DD/YYYY HH:mm:ss A'))
            //         client.guilds.cache.get(guild.id).channels.cache.get(res.audit).send(embed2)
            // }
          }
        },
      );
    }
  },
};
