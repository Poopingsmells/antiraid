const { SlashCommandBuilder } = require("@discordjs/builders");
const cases = require("../models/cases");
const AntiEmbed = require("../Functions/AntiEmbed");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("Returns information about a case")
    .addIntegerOption((caseNumber) =>
      caseNumber
        .setName("case")
        .setDescription("The number of the case")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_MESSAGES"],
    userLevel: 2,
  },
  run: (interaction) => {
    const args = [interaction.options.getInteger("case")];
    cases.findOne(
      {
        serverId: interaction.guild.id,
        caseId: args,
      },
      (err, res) => {
        if (!res) {
          return interaction.reply({
            content: "❌ Can't find that case!",
            ephemeral: true,
          });
        }
        cases
          .find({
            serverId: interaction.guild.id,
            targetId: res.targetId,
          })
          .sort([["descending"]])
          .exec((err, res2) => {
            const reason = res.reason ?? "No reason provided";
            let mod = "";
            if (res.modId == undefined) {
              mod = "Automod";
            } else {
              interaction.client.users.fetch(res.modId).then((member) => {
                mod = member.tag ?? res.modId;
              });
            }
            const number = res2.length - 1;
            interaction.client.users.fetch(res.targetId).then((member) => {
              const embed = new AntiEmbed()
                .setTitle(
                  "📃 Case Number #" + args,
                  member.displayAvatarURL({ dynamic: true }),
                )
                .addField("Member ", member.tag + "(``" + res.targetId + "``)")
                .addField("Reason: ", "``" + reason + "``")
                .addField("Action: ", res.type, true)
                .addField("Moderator: ", mod, true)
                .setDescription(
                  "That user has " + number + " other cases in this server",
                )
                .setFooter({
                  text: "Requested by " + interaction.user.tag,
                  iconURL: interaction.user.displayAvatarURL(),
                });
              interaction.reply({ embeds: [embed] });
            });
          });
      },
    );
  },
};
