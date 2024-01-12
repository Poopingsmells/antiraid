const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "moderation",
  requirements: {
    user: ["MANAGE_MESSAGES"],
    userLevel: 2,
  },
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipes a deleted or edited message")
    .addChannelOption((channel) =>
      channel
        .setName("channel")
        .setDescription(
          "The channel you want to check for deleted or edited messages",
        )
        .setRequired(true),
    )
    .addStringOption((edited) =>
      edited
        .setName("type")
        .setDescription("Whether to check for deleted or edited messages")
        .setRequired(true)
        .addChoice("Yes", "true")
        .addChoice("No", "false"),
    ),
  run: async (interaction) => {
    const ch = interaction.options.getChannel("channel");
    const edited = interaction.options.getBoolean("edited");
    if (edited == "false") {
      const sniped = interaction.client.snipes.get(ch.id);
      const embed = new MessageEmbed();
      embed.setTitle(
        "✅ Sniped A Deleted Message",
        interaction.client.user.displayAvatarURL({ dynamic: true }),
      );
      embed.setDescription(`${sniped.content}` || "Couldn't get content");
      embed.addField(
        "Sender:",
        interaction.client.users.cache.get(sniped.author).tag,
        true,
      );
      embed.addField("Channel:", ch.name || "Can't get channel", true);
      embed.addField("Sniped by:", `**${interaction.user.tag}**`, true);
      embed.setFooter({
        text: `Deleted At: ${sniped.time}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });
      embed.setColor("DARK_RED");
      if (sniped.image) {
        embed.setImage(sniped.image);
      }
      interaction.reply({ embeds: [embed] });
      if (!sniped) {
        const embed1 = new MessageEmbed();
        embed1.setDescription("❌ No deleted messages");
        return interaction.reply({ embeds: [embed1] });
      }
    } else if (edited == "true") {
      const sniped1 = interaction.client.esnipes.get(ch.id);
      const embed2 = new MessageEmbed();
      embed2.setTitle(
        "✅ Sniped An Edited Message",
        interaction.client.user.displayAvatarURL({ dynamic: true }),
      );
      embed2.addField("Before Edit:", sniped1.old);
      embed2.addField("After Edit:", sniped1.new);
      embed2.addField(
        "Sender:",
        interaction.client.users.cache.get(sniped1.author).tag,
        true,
      );
      embed2.addField("Channel:", ch.name, true);
      embed2.addField("Sniped by:", `**${interaction.user.tag}**`, true);
      embed2.setFooter({
        text: `Edited At: ${sniped1.created}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });
      embed2.setColor("DARK_RED");
      interaction.reply({ embeds: [embed2] });
      if (!sniped1) {
        interaction.reply({
          content: "There isnt any edited messages",
          ephemeral: true,
        });
      }
    }
  },
};
