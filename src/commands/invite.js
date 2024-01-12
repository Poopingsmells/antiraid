const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sends Antiraid's invite links"),
  category: "utility",
  run: async (interaction) => {
    const admininv = await interaction.client.generateInvite({
      scopes: ["bot", "applications.commands"],
      permissions: Permissions.FLAGS.ADMINISTRATOR,
    });
    const nopermsinv = await interaction.client.generateInvite({
      scopes: ["bot", "applications.commands"],
    });
    interaction.reply({
      content: `[No permissions invite](${nopermsinv})\n[Administrator permissions invite](${admininv}) (recommended)`,
    });
  },
};
