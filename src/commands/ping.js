const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "info",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks AntiRaid's Response time in milliseconds"),
  run: async (interaction) => {
    const choices = [
      "Is this really my ping?",
      "Is this okay? I can't look!",
      "I hope it isn't bad!",
      "Is it ok?",
    ];
    const response = choices[Math.floor(Math.random() * choices.length)];
    const embed = new MessageEmbed()
      .setColor("BLUE")
      .setTitle("Ping Pong")
      .setURL("https://antiraid.xyz/")
      .addField("Bot Ping", `${interaction.client.ws.ping}ms`, true)
      .addField("Bot Opinion", response, true);
    interaction.reply({ embeds: [embed] });
  },
};
