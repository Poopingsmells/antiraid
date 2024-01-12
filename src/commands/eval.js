const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");
const sourcebin = require("sourcebin");
const clean = (text, interaction) => {
  if (typeof text === "string") {
    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(
        new RegExp(interaction.client.config.token, "gi"),
        "oh wait why u need my token?",
      );
  }
  return text;
};
const { inspect } = require("util");
const { Type } = require("@extreme_hero/deeptype");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluate a code (owner only)")
    .addStringOption((code) =>
      code
        .setName("code")
        .setDescription("The code to evaluate")
        .setRequired(true),
    ),
  category: "owner",
  ownerOnly: true,
  /**
   * @param {CommandInteraction} interaction
   */
  run: async (interaction) => {
    // const devs = interaction.client.config.dev;
    // if (!devs.has(interaction.user.id)) return interaction.reply({ content: 'This is an owner-only command' });
    let code = interaction.options.getString("code", false);
    if (!code)
      return interaction.reply({ content: "What am I supposed to do?!" });
    code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    let evaled;
    try {
      const start = process.hrtime();
      evaled = await eval(code);
      if (eval instanceof Promise) {
        evaled = await evaled;
      }

      const stop = process.hrtime(start);
      const response = [
        `**Output**: \`\`\`js\n${clean(
          inspect(evaled, { depth: 0 }),
          interaction,
        )}\n\`\`\``,
        `**Type:** \`\`\`ts\n${new Type(evaled).is}\n\`\`\``,
        `**Time:** \`\`\`${(stop[0] * 1e9 + stop[1]) / 1e6}ms \`\`\``,
      ];
      const res = response.join("\n");
      if (res.length < 2000) {
        await interaction.reply({ content: res });
      } else {
        let output = await sourcebin.create(
          [
            {
              name: "output",
              content: res,
              languageId: "js",
            },
          ],
          {
            title: "Evaluation Output",
            description: "Outcome of eval command.",
          },
        );
        output = output.url;

        await interaction.reply({ content: output });
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: `Error: \`\`\`xl\n${clean(err, interaction)}\n\`\`\``,
      });
    }
  },
};
