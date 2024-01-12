/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require("@discordjs/builders");
const child = require("child_process");
const { MessageEmbed } = require("discord.js");
module.exports = {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("pull")
    .setDescription("Execute git pull to update AntiRaid's code"),
  requirements: {
    user: [],
    userLevel: 10,
  },
  ownerOnly: true,
  run: (interaction) => {
    child.exec("git pull origin production", (err, res) => {
      if (err) {
        const errembed = new MessageEmbed()
          .setTitle(":x: | Error")
          .setDescription(
            "I have encoutered an error while trying to run `git pull`",
          )
          .addField("Error:", ""`\n${err}\n```)
          .setColor("RED");
        return interaction.reply({ embeds: [errembed], ephemeral: true });
      }
      const succembed = new MessageEmbed()
        .setTitle("✅ | Success")
        .setDescription("Pull Succesfull :)")
        .addField("Message", ""`\n${res}\n```)
        .setColor("GREEN");
      return interaction.reply({ embeds: [succembed] });
    });
  },
};
