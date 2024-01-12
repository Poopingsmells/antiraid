const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const servers = require("../models/servers");
const moment = require("moment");

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warns a member")
    .addUserOption((user) =>
      user
        .setName("member")
        .setDescription("The member to be warned")
        .setRequired(true),
    )
    .addStringOption((rs) =>
      rs.setName("reason").setDescription("The reason for the warn"),
    ),
  requirements: {
    user: ["MANAGE_MESSAGES"],
    userLevel: 2,
  },
  ownerOnly: false,
  run: (interaction) => {
    const userses = interaction.options.getMember("member");
    const usersesuser = interaction.options.getUser("member");
    servers.findOne(
      {
        guildID: interaction.guild.id,
      },
      (err, serverman) => {
        if (userses.user.bot) {
          return interaction.reply({
            content: "❌ You can't warn bot!",
            ephemeral: true,
          });
        }
        if (userses == interaction.user) {
          return interaction.reply({
            content: "❌ Can't warn yourself!",
            ephemeral: true,
          });
        }
        if (
          userses.roles.highest.position >=
          interaction.member.roles.highest.position
        ) {
          return interaction.reply({
            content:
              "❌ You can't warn person have roles higher than or same to you!",
            ephemeral: true,
          });
        }
        let reason = interaction.options.getString("reason");
        if (!reason) reason = "No Reason Provided";
        cases
          .find({
            serverId: interaction.guild.id,
          })
          .sort([["descending"]])
          .exec((err, res) => {
            if (res.length == serverman.maxwarns) {
              if (!interaction.guild.roles.cache.get(serverman.mutedrole))
                return interaction.reply(
                  "I Can't find that mute role you set , to add mute role from dashboard <https://antiraid.xyz/>",
                );
              if (userses.roles.cache.get(serverman.mutedrole))
                return interaction.reply(
                  "That user got max warns exceeded so he is currently muted!",
                );
              const role = interaction.guild.roles.cache.get(
                serverman.mutedrole,
              );
              userses.roles.add(role);
              return interaction.reply({
                content: "⚠️ Max warns exceeded for that user, he got muted",
              });
            }
            const cases1 = new cases({
              targetId: userses.user.id,
              reason: reason,
              type: "Warn",
              modId: interaction.user.id,
              serverId: interaction.guild.id,
              caseId: res.length + 1,
            });
            cases1.save();
            const embed = new MessageEmbed()
              .setTitle(`${interaction.guild.name} | Warn`)
              .setColor("RED")
              .setDescription(
                `Case Number: \`#${res.length}\` \nModerator: **${interaction.user.tag}** (\`${interaction.user.id}\`) \nAllegation: **${userses.user.tag}** (\`${userses.user.id}\`)`,
              )
              .addField("**Reason**", reason)
              .setFooter({
                text: moment(interaction.createdAt).format(
                  "MM/DD/YYYY HH:mm:ss A",
                ),
              });
            usersesuser.send({ embeds: [embed] });
            servers.findOne(
              {
                guildID: interaction.guild.id,
              },
              (err, res) => {
                const channel = interaction.guild.channels.cache.get(res.mod);
                if (channel) {
                  channel.send({
                    content: `⚠️ **${userses.user.tag}** has been warned by **${interaction.user.tag}**, Reason: **${reason}**`,
                  });
                }
              },
            );
            interaction.reply({
              content: `⚠️ **${userses.user.tag}** has been warned , Reason: **${reason}**`,
            });
          });
      },
    );
  },
};
