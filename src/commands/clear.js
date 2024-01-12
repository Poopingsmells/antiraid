const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Mass delete messages")
    .addIntegerOption((number) =>
      number
        .setName("number")
        .setDescription("Number of messages to delete")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_MESSAGES"],
    client: ["MANAGE_MESSAGES"],
    userLevel: 2,
  },
  category: "utility",
  /**
   * @param {CommandInteraction} interaction
   */
  run: async (interaction) => {
    if (
      interaction.options.getInteger("number") < 1 ||
      interaction.options.getInteger("number") > 100
    )
      return interaction.reply({
        content:
          "You must specify a number of messages to purge that is between 1 and 100",
      });

    try {
      const fetch = await interaction.channel.messages.fetch({
        limit: interaction.options.getInteger("number"),
      });
      const deletedMessages = await interaction.channel.bulkDelete(fetch, true);

      const results = {};
      for (const [, deleted] of deletedMessages) {
        const user = `${deleted.author.username}#${deleted.author.discriminator}`;
        if (!results[user]) results[user] = 0;
        results[user]++;
      }

      const userMessageMap = Object.entries(results);

      const finalResult = `${deletedMessages.size} message${
        deletedMessages.size > 1 ? "s" : ""
      } were deleted!\n\n${userMessageMap
        .map(([user, messages]) => `**${user}** : ${messages}`)
        .join("\n")}`;
      await interaction.reply({ content: finalResult });
    } catch (err) {
      if (String(err).includes("Unknown Message"))
        return console.log("[ERROR!] Unknown Message");
    }
  },
};
