/* eslint-disable no-unused-vars */
const { MessageEmbed, CommandInteraction } = require("discord.js");
const servers = require("../models/servers");
const cases = require("../models/cases");
const moment = require("moment");
const CLOCK = require("../models/clock");

const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a member")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("The user who you want to unmute")
        .setRequired(true),
    )
    .addStringOption((str) =>
      str.setName("reason").setDescription("The reason for the unmute"),
    ),
  requirements: {
    user: ["MUTE_MEMBERS"],
    client: ["MANAGE_NICKNAMES"],
    userLevel: 2,
  },
  ownerOnly: false,
  /**
   *
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const member2 = interaction.options.getMember("user");
    const user2 = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided.";
    servers.findOne(
      {
        guildID: interaction.guild.id,
      },
      (err, welchannel) => {
        if (welchannel.mutedrole === "String") {
          return interaction.reply({
            content:
              "❌ You should configure muted role by from dashboard <https://antiraid.xyz/>",
            ephemeral: true,
          });
        }
        if (!interaction.guild.roles.cache.get(welchannel.mutedrole)) {
          return interaction.reply({
            content:
              "❌ I can't find the mute role try set another one from dashboard <https://antiraid.xyz/>",
            ephemeral: true,
          });
        }
        if (!member2.roles.cache.get(welchannel.mutedrole)) {
          return interaction.reply({
            content:
              "❌ That user is not muted or does not have the" +
              `\`${
                interaction.guild.roles.cache.get(welchannel.mutedrole).name
              }\`` +
              " role!",
            ephemeral: true,
          });
        }
        if (
          member2.roles.highest.position >=
          interaction.member.roles.highest.position
        ) {
          return interaction.reply({
            content:
              "❌ You can't unmute person have roles higher than or same to you!",
            ephemeral: true,
          });
        }
        const role2 = interaction.guild.roles.cache.get(welchannel.mutedrole);
        if (role2.position >= interaction.guild.me.roles.highest.position)
          return interaction.reply({
            content: "Mute role is higher than my role or same to me!",
            ephemeral: true,
          });
        servers.findOne(
          {
            guildID: interaction.guild.id,
          },
          (err, res) => {
            const channel = interaction.guild.channels.cache.get(res.mod);
            if (channel) {
              channel.send(
                "🔊 ``" +
                  member2.user.tag +
                  "`` has been unmuted by ``" +
                  interaction.user.tag +
                  "`` , Reason: ``" +
                  reason +
                  "``",
              );
            }
          },
        );
        member2.roles
          .remove(role2)
          .catch(console.error)
          .then(
            interaction.reply(
              "🔊 ``" +
                member2.user.tag +
                "`` has been unmuted by ``" +
                interaction.user.tag +
                "`` , Reason: ``" +
                reason +
                "``",
            ),
          );
        member2.setNickname(member2.user.username);
        CLOCK.findOne(
          {
            userID: member2.user.id,
            action: "Mute",
            serverID: interaction.guild.id,
          },
          async (err, res) => {
            if (res) {
              res.deleteOne();
            }
          },
        );
        CLOCK.findOne(
          {
            userID: member2.user.id,
            action: "TempMute",
            serverID: interaction.guild.id,
          },
          async (err, res) => {
            if (res) {
              res.deleteOne();
            }
          },
        );
        cases
          .find({
            serverId: interaction.guild.id,
          })
          .sort([["descending"]])
          .exec((err, res3) => {
            const cases1 = new cases({
              targetId: member2.user.id,
              reason: reason,
              type: "Unmute",
              modId: interaction.user.id,
              serverId: interaction.guild.id,
              caseId: res3.length + 1,
            });
            cases1.save();
            const embed = new MessageEmbed()
              .setTitle(
                `${interaction.guild.name} | Unmute`,
                interaction.guild.iconURL({ dynamic: true }),
              )
              .setColor("GREEN")
              .setDescription(
                `Case Number: \`#${res3.length}\` \nModerator: **${interaction.user.tag}** (\`${interaction.user.id}\`) \nAllegation: **${member2.user.tag}** (\`${member2.user.id}\`)`,
              )
              .addField("**Reason**", reason)
              .setFooter({
                text: moment(interaction.createdAt).format(
                  "MM/DD/YYYY HH:mm:ss A",
                ),
              });
            user2.send({ embeds: [embed] });
          });
      },
    );
  },
};
