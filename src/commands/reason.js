const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const servers = require("../models/servers");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("reason")
    .setDescription("Updates the reason for specified case")
    .addIntegerOption((int) =>
      int
        .setName("case")
        .setDescription("The case to be updated")
        .setRequired(true),
    )
    .addStringOption((reason) =>
      reason
        .setName("newreason")
        .setDescription("The new reason for the case")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_GUILD"],
    userLevel: 3,
  },
  ownerOnly: false,
  run: (interaction) => {
    const caseNumber = interaction.options.getInteger("case");
    let reason = interaction.options.getString("reason");
    cases.findOne(
      {
        serverID: interaction.guild.id,
        case: caseNumber,
      },
      (err, res) => {
        if (!res) {
          return interaction.reply({
            content: "Can't find that case!",
            ephemeral: true,
          });
        }
        if (res.reason == "") {
          reason = "No reason Provided";
        } else {
          reason = res.reason;
        }
        const embed = new MessageEmbed();
        embed.setTitle(
          "✏️ Case Number #" + caseNumber,
          interaction.guild.iconURL({ dynamic: true }),
        );
        embed.setDescription("Editing reason of case number " + caseNumber);
        embed.addField("Old Reason: ", "``" + reason + "``");
        res.reason = reason;
        res.save();
        embed.addField("New Reason: ", "``" + res.reason + "``", true);
        embed.setFooter({
          text: "Changed by " + interaction.author.tag,
          iconURL: interaction.author.displayAvatarURL({ dynamic: true }),
        });
        interaction.reply({ embeds: [embed] });
        servers.findOne(
          {
            guildID: interaction.guild.id,
          },
          (err, res) => {
            const channel = interaction.guild.channels.cache.get(res.mod);
            if (channel) {
              channel.send(
                `✏️ Reason of case number \`#${caseNumber}\` has been changed by **${interaction.author.tag}**`,
              );
            }
          },
        );
      },
    );
  },
};
