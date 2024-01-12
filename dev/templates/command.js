const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("").setDescription(""),
  category: "",
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    // content here
  },
};
