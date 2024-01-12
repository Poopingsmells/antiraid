// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require("discord.js");
const cases = require("../models/cases");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("userwarns")
    .setDescription("See a user's warns")
    .addUserOption((usr) =>
      usr
        .setName("user")
        .setDescription("The user you want to check for warns")
        .setRequired(true),
    ),
  /**
   * @param {CommandInteraction} interaction
   * @returns
   */
  run: (interaction) => {
    const userses = interaction.options.getUser("user") || interaction.user;
    // console.log(choice);
    if (!userses) {
      const embed = new MessageEmbed()
        .setTitle("❌ Error Occured")
        .setDescription("**Note**", "Maybe that user isn't in the server")
        .setColor("BLACK");
      return interaction.reply({ embeds: [embed] });
    }
    if (userses.bot) {
      return interaction.reply("❌ Bots don't have warns!");
    }
    cases.find(
      {
        serverId: interaction.guild.id,
        type: "Warn",
        targetId: userses.id,
      },
      (err, res) => {
        cases.find(
          {
            serverId: interaction.guild.id,
            targetId: userses.id,
          },
          async (err, res2) => {
            const embed2 = new MessageEmbed()
              .setTitle(`📃 ${userses.username}` + " Warns!")
              .setColor("#4000FF")
              .setTitle(
                `${userses.username}'s warns & cases in ${interaction.guild.name}`,
                userses.displayAvatarURL({ dynamic: true }),
              );
            if (res) {
              embed2.setDescription(`Warns: ${res.length}`, true);
              let str = "";
              for (let i = 0; i < res.length; i++) {
                str += `\`${res[i].caseId}\` `;
              }
              embed2.addField("🆔 **Cases IDs**", str, true);
              let caseas = "";
              for (let s = 0; s < res2.length; s++) {
                caseas += `\`${res2[s].caseId}\` `;
              }
              embed2.addField(
                `🏷 **All \`${userses.username}\` Cases IDs**`,
                caseas,
              );
              if (err) {
                console.error(err);
              }
              return interaction.reply({ embeds: [embed2] });
            }

            if (!res) {
              embed2.setDescription("Warns: 0", true);
              return interaction.reply({ embeds: [embed2] });
            }
          },
        );
      },
    );
  },
};
