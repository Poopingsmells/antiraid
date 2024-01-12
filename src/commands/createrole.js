const servers = require("../models/servers");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Create a role in the server")
    .addStringOption((name) =>
      name
        .setName("name")
        .setDescription("The name for the role")
        .setRequired(true),
    )
    .addBooleanOption((hoist) =>
      hoist
        .setName("hoist")
        .setDescription("Should the role be hoisted?")
        .setRequired(true),
    )
    .addStringOption((str) =>
      str
        .setName("color")
        .setDescription(
          "The color for the role. Must be all UPPERCASE ( i.e RED )",
        )
        .setRequired(true),
    )
    .addBooleanOption((mention) =>
      mention
        .setName("mention")
        .setDescription(
          "The role can be mentioned by anyone if you select True",
        )
        .setRequired(true),
    ),
  category: "moderation",
  requirements: {
    user: ["MANAGE_ROLES"],
  },
  ownerOnly: false,
  run: async (interaction) => {
    const role_name_and_color = interaction.options.getString("name");
    const color = interaction.options.getString("color");
    const hoist = interaction.options.getBoolean("hoist");
    const mention = interaction.options.getBoolean("mention");
    try {
      interaction.guild.roles.create({
        name: role_name_and_color,
        color: color,
        hoist: hoist,
        mentionable: mention,
        reason: `Requested from createrole command | ${interaction.user.tag}`,
      });
      interaction.reply("☑ Successfully created the role");
      servers.findOne(
        {
          guildID: interaction.guild.id,
        },
        (err, res) => {
          const channel = interaction.guild.channels.cache.get(res.mod);
          if (channel) {
            channel.send(
              "🛠 ``" +
                role_name_and_color +
                "`` role has been created from ``" +
                interaction.user.tag +
                "``!",
            );
          }
        },
      );
    } catch (err) {
      interaction.reply({
        content:
          "✖ Error creating this role! If this continues report this bug to `https://antiraid.xyz/bug` with full explanation and proof!",
        ephemeral: true,
      });
    }
  },
};
