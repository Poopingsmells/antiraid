// eslint-disable-next-line no-unused-vars
const { ButtonInteraction } = require("discord.js");
const AntiEmbed = require("../Functions/AntiEmbed");

module.exports = {
  name: "buttonClick",
  /**
   * @param {ButtonInteraction} button
   */
  run: async (button) => {
    const client = button.client;
    await button.deferReply({ ephemeral: true });

    const firstPart = button.id.split("-")[0];
    const command = client.buttons.find((b) => b.id == firstPart);

    if (command) {
      try {
        command.execute(button);
      } catch {
        button.editReply({
          embeds: [
            new AntiEmbed(button.client).error(
              "An error occcured while replying to this interaction.",
            ),
          ],
        });
      }
    }
  },
};
