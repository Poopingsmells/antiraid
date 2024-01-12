/* eslint-disable no-mixed-spaces-and-tabs */
const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "guildMemberRemove",
  run: (client, member) => {
    if (member.guild) {
      servers.findOne(
        {
          guildID: member.guild.id,
        },
        (err, res) => {
          if (!res) return;
          if (res.leaveChannel !== "String" && res.leaveMsg == "String") {
            if (
              !client.guilds.cache
                .get(member.guild.id)
                .channels.cache.get(res?.leave)
            )
              return;
            const messages = [
              `**Good Bye ${member}**`,
              `**${member} left us alone**`,
              `**Bye ${member} hope you back again!**`,
              `**${member} just left**`,
              `**${member} just left**`,
              `**${member} just left**`,
              `**We will miss you ${member} bye!!**`,
              `**${member} good bye**`,
              `**${member} left**`,
              `**We are not lucky anymore with you ${member} bye!**`,
            ];
            if (res.EmbedsForJoinLeave === "normal") {
              client.guilds.cache
                .get(member.guild.id)
                .channels.cache.get(res?.leave)
                .send({
                  content:
                    messages[Math.ceil(Math.random() * messages.length)] ||
                    `**Good Bye ${member}**`,
                });
            } else if (res.EmbedsForJoinLeave === "embed") {
              const emebf = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  messages[Math.ceil(Math.random() * messages.length)],
                )
                .setFooter(
                  "Copyright © 2021 - 2022 | AntiRaid - All Rights Reserved!",
                  member.user.displayAvatarURL({ dynamic: true }),
                );
              client.guilds.cache
                .get(member.guild.id)
                .channels.cache.get(res?.leave)
                .send({ embeds: [emebf] });
            }
          } else {
            if (
              !client.guilds.cache
                .get(member.guild.id)
                .channels.cache.get(res?.leave)
            )
              return;
            if (res.leaveMsg !== "String") {
              let leavemsg = res.leaveMsg;
              if (leavemsg.includes("{member}")) {
                leavemsg = leavemsg.replace("{member}", member);
              }
              if (leavemsg.includes("{member.tag}")) {
                leavemsg = leavemsg.replace("{member.tag}", member.user.tag);
              }
              if (leavemsg.includes("{guild.name}")) {
                leavemsg = leavemsg.replace("{guild.name}", member.guild.name);
              }
              if (leavemsg.includes("{guild.memberCount}")) {
                leavemsg = leavemsg.replace(
                  "{guild.memberCount}",
                  member.guild.memberCount,
                );
              }
              if (leavemsg.includes("{member.username}")) {
                leavemsg = leavemsg.replace(
                  "{member.username}",
                  member.user.username,
                );
              }
              if (res.EmbedsForJoinLeave === "embed") {
                const emebf = new MessageEmbed()
                  .setColor("RED")
                  .setDescription(leavemsg)
                  .setFooter({
                    text: "Copyright © 2021 - 2022 | AntiRaid - All Rights Reserved!",
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                  });
                client.guilds.cache
                  .get(member.guild.id)
                  .channels.cache.get(res?.leave)
                  .send({ embeds: [emebf] });
              } else if (res.EmbedsForJoinLeave === "normal") {
                client.guilds.cache
                  .get(member.guild.id)
                  .channels.cache.get(res?.leave)
                  .send({ content: leavemsg });
              }
            }
          }
        },
      );
    }
  },
};
