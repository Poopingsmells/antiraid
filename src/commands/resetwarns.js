const cases = require("../models/cases");
const servers = require("../models/servers");
const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("resetwarns")
    .setDescription("Resets a user's warns")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("The user you want to reset warns")
        .setRequired(true),
    ),
  requirements: {
    user: [],
  },
  ownerOnly: false,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const userses = interaction.options.getMember("user");
    if (userses.user.bot) {
      return interaction.reply({
        content: "❌ You can't resetwarns of bot!",
        ephemeral: true,
      });
    }
    if (
      userses.roles.highest.position >=
      interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "❌ You can't resetwarns of person have roles higher than or same to you!",
        ephemeral: true,
      });
    }
    cases.find(
      {
        serverId: interaction.guild.id,
        type: "Warn",
        targetId: userses.id,
      },
      (err, res) => {
        if (res.length === 0) {
          return interaction.reply(
            "❌ That user doesn't have any warns to reset!",
          );
        }
        res.forEach((warns) => {
          warns.deleteOne();
        });
        interaction.deferReply(
          `✅ Successfully reseted warns of **${userses.user.tag}**`,
        );
        servers.findOne(
          {
            guildID: interaction.guild.id,
          },
          (err, res) => {
            const channel = interaction.guild.channels.cache.get(res.mod);
            if (channel) {
              channel.send(
                `✅ Warns of **${userses.user.username}** have been reset by **${interaction.user.tag}**`,
              );
            }
          },
        );
      },
    );
  },
};
