const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  category: "info",
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Sends an invite to AntiRaid's Support Server"),
  run: async (interaction) => {
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor("DARK_BLUE")
          .setDescription(
            "Here is my support server link: https://discord.gg/tHfKQwmNVt",
          ),
      ],
    });
  },
};
