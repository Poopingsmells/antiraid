/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable no-unused-vars
const { CommandInteraction } = require("discord.js");
const AntiEmbed = require("../Functions/AntiEmbed");

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change a server member its nickname")
    .addUserOption((user) =>
      user
        .setName("member")
        .setDescription("The member to change his/her nickname")
        .setRequired(true),
    )
    .addBooleanOption((reset) =>
      reset
        .setName("reset")
        .setDescription("Do you want to reset that member's nickname?")
        .setRequired(true),
    )
    .addStringOption((nick) =>
      nick.setName("nick").setDescription("The nickname for the user"),
    ),
  requirements: {
    user: ["MANAGE_NICKNAMES"],
    userLevel: 3,
  },
  ownerOnly: false,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const member = interaction.options.getMember("member");
    const reset = interaction.options.getBoolean("reset");
    const nick = interaction.options.getString("nick");
    let nickStr = "";
    if (reset === true) {
      nickStr = null;
      member.setNickname(nickStr, `/nick × [ ${interaction.user.tag} ]`);
      interaction.reply({
        embeds: [
          new AntiEmbed(interaction.client).success(
            `Successfully reset **${member.user.tag}**'s nickname`,
          ),
        ],
      });
    } else {
      if (nick.length > 32)
        return interaction.reply({
          embeds: [
            new AntiEmbed(interaction.client).warn(
              "The nickname characters length must be equal / shorter to 32 characters",
            ),
          ],
          ephemeral: true,
        });
      nickStr = nick;
      member.setNickname(nickStr, `/nick × [ ${interaction.user.tag} ]`);
      interaction.reply({
        embeds: [
          new AntiEmbed(interaction.client).success(
            `Successfully set **${member.user.tag}**'s nickname to \`${nickStr}\``,
          ),
        ],
      });
    }
  },
};
