const servers = require("../models/servers");

const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Delete a role in the server")
    .addRoleOption((role) =>
      role.setName("role").setDescription("The role to be deleted"),
    ),
  category: "moderation",
  requirements: {
    user: ["MANAGE_ROLES"],
  },
  ownerOnly: false,
  run: async (interaction) => {
    const role_name_and_color = interaction.options.getRole("role");
    try {
      role_name_and_color.delete(
        `Requested from deleterole command | ${interaction.user.tag}`,
      );
      interaction.reply("☑ Successfully deleted the role");
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
                "`` role has been deleted" +
                " deleted from ``" +
                interaction.user.tag +
                "``!",
            );
          }
        },
      );
    } catch (err) {
      interaction.reply({
        content:
          "✖ Error deleting this role! If this continues report this bug to `https://antiraid.xyz/bug` with full explanation and proof!",
        ephemeral: true,
      });
    }
  },
};
