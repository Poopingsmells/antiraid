const { SlashCommandBuilder } = require("@discordjs/builders");
const cases = require("../models/cases");

module.exports = {
  category: "moderation",
  requirements: {
    user: ["MANAGE_MESSAGES"],
    userLevel: 2,
  },
  data: new SlashCommandBuilder()
    .setName("scan")
    .setDescription("Scans a user and shows his safety")
    .addUserOption((user) =>
      user
        .setName("target")
        .setDescription("The user to scan")
        .setRequired(true),
    ),
  run: async (interaction) => {
    const member = interaction.options.getUser("target");
    cases.find(
      {
        userID: member.id,
      },
      (err, res) => {
        if (res.length === 0) {
          return interaction.reply({
            content: `**${member.tag}** is 100% safe with no infractions!`,
          });
        } else {
          let perc = 100 - (res.length + 5);
          if (perc === 0) {
            perc = 0;
          }
          return interaction.reply({
            content: `**${member.tag}** is ${perc}% safe with ${res.length} infractions!`,
          });
        }
      },
    );
  },
};
