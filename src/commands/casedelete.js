const cases = require("../models/cases");
const servers = require("../models/servers");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("deletecase")
    .setDescription("Deletes a server case!")
    .addIntegerOption((int) =>
      int
        .setName("number")
        .setDescription("The case number you want to delete!")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_GUILD"],
    userLevel: 4,
  },
  ownerOnly: false,
  run: (interaction) => {
    const caseNumber = interaction.options.getInteger("number");
    cases.findOneAndDelete(
      {
        serverId: interaction.guild.id,
        caseId: caseNumber,
      },
      (err, res) => {
        if (!res) {
          return interaction.reply({
            content: "Seems like i can't find that case!",
            ephemeral: true,
          });
        } else {
          servers.findOne(
            {
              guildID: interaction.guild.id,
            },
            (err, res) => {
              const channel = interaction.guild.channels.cache.get(res.mod);
              if (channel) {
                channel.send(
                  `🗑️ Case number \`#${caseNumber}\` has been deleted from server by **${interaction.user.tag}**.`,
                );
              }
            },
          );
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle("🗑️ | Case Deleted")
                .setColor("ORANGE")
                .setDescription(
                  `Case deleted succesfully \nCase number - \`${caseNumber}\``,
                ),
            ],
          });
        }
      },
    );
  },
};
