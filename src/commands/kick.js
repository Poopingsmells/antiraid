const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const servers = require("../models/servers");
const moment = require("moment");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the server")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("The user you want to kick")
        .setRequired(true),
    )
    .addBooleanOption((bool) =>
      bool
        .setName("dm")
        .setDescription("Whether to DM the user. False by default."),
    )
    .addStringOption((reason) =>
      reason
        .setName("reason")
        .setDescription("The reason for kicking this member"),
    ),
  requirements: {
    user: ["KICK_MEMBERS"],
    userLevel: 2,
  },
  run: (interaction) => {
    const member = interaction.options.getMember("user");
    const sendDMtoggle = interaction.options.getBoolean("dm", false) || false;
    let reason = interaction.options.getString("reason");
    if (reason) {
      reason = "No reason provided!";
    }
    member
      .kick(`${reason} - [ ${interaction.user.tag} ]`)
      .then(() => {
        servers.findOne(
          {
            guildID: interaction.guild.id,
          },
          (err, res) => {
            const channel = interaction.guild.channels.cache.get(res.mod);
            if (channel) {
              channel.send(
                `👢 **${member.user.tag}** has been kicked from server by **${interaction.user.tag}**.\nReason: **${reason}**`,
              );
            }
          },
        );
        interaction.reply(
          `👢 Successfully Kicked **${member.user.tag}**.\nReason: **${reason}**`,
        );
        cases
          .find({
            serverID: interaction.guild.id,
          })
          .sort([["descending"]])
          .exec((err, res) => {
            const cases1 = new cases({
              targetId: member.user.id,
              reason: reason,
              type: "Kick",
              modId: interaction.user.id,
              serverId: interaction.guild.id,
              time: moment(interaction.createdAt).format(
                "MM/DD/YYYY HH:mm:ss A",
              ),
              caseId: res.length + 1,
            });
            cases1.save();
            if (sendDMtoggle == true) {
              const embed = new MessageEmbed()
                .setTitle(
                  `${interaction.guild.name} | Kick`,
                  interaction.guild.iconURL({ dynamic: true }),
                )
                .setColor("RED")
                .setDescription(
                  `Case Number: \`#${res.length}\` \nModerator: **${interaction.user.tag}** (\`${interaction.user.id}\`) \nAllegation: **${member.user.tag}** (\`${member.id}\`)`,
                )
                .addField("**Reason**", reason)
                .setFooter({
                  text: moment(interaction.createdAt).format(
                    "MM/DD/YYYY HH:mm:ss A",
                  ),
                });
              // eslint-disable-next-line no-empty-function
              member.send(embed);
            }
          });
      })
      .catch(() => {
        const embed2 = new MessageEmbed()
          .setColor("RED")
          .setDescription(
            "I was unable to kick the member. Check if their roles are higher then mine or if they have administrative permissions!",
          );
        return interaction.reply({ embeds: [embed2], ephemeral: true });
      });
  },
};
