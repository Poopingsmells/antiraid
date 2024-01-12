const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");

module.exports = {
  category: "developer",
  data: new SlashCommandBuilder()
    .setName("dbsearch")
    .setDescription("Searches the Antiraid database")
    .addStringOption((schema) =>
      schema
        .setName("schema")
        .setDescription("Which schema to search")
        .setRequired(true)
        .addChoices([["something", "somehting"]]),
    ),
  requirements: {
    user: [],
  },
  ownerOnly: true,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    interaction.reply({ content: "Not finished", ephemeral: true });
  },
};
