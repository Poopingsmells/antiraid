/* eslint-disable no-unused-vars */
const { CommandInteraction, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const AntiEmbed = require("../Functions/AntiEmbed");
const cooldowns = new Set();

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Sends a message to a specific channel")
    .addChannelOption((ch) =>
      ch
        .setName("target")
        .setDescription("The channel you want to send a message to")
        .setRequired(true),
    )
    .addBooleanOption((em) =>
      em
        .setName("embedded")
        .setDescription("Whether the message should be embedded")
        .setRequired(true),
    )
    .addStringOption((str) =>
      str
        .setName("message")
        .setDescription("The message you want to send")
        .setRequired(true),
    ),
  requirements: {
    user: [],
  },
  ownerOnly: false,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const channel = interaction.options.getChannel("target");
    const type = interaction.options.getBoolean("embedded");
    const msg = interaction.options.getString("message");
    if (!interaction.member.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) {
      return interaction.reply({
        content: "You cannot send messages in the selected channel",
      });
    }
    if (cooldowns.has(interaction.user.tag)) {
      return interaction.reply({
        embeds: [
          new AntiEmbed().error(
            "You are on cooldown. This command can be used once in 15 seconds",
          ),
        ],
      });
    }
    cooldowns.add(interaction.user.tag);
    if (type) {
      channel.send({ content: msg });
      interaction.reply({ content: "Sent your message!", ephemeral: true });
    } else if (type === "yes") {
      const embed = new AntiEmbed()
        .setDescription(msg)
        .setTitle(
          `Sent by ${interaction.user.tag} (${interaction.user.id})`,
          interaction.user.displayAvatarURL({ dynamic: true }),
        );
      channel.send({ embeds: [embed] });
      interaction.reply({ content: "Sent your message!", ephemeral: true });
    }
    setTimeout(() => {
      cooldowns.delete(interaction.user.tag);
    }, 15e3);
  },
};
