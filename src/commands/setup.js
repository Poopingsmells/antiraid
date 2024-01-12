const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const servers = require("../models/servers");
const wait = require("util").promisify(setTimeout);

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Easily setup the bot")
    .addBooleanOption((auto) =>
      auto
        .setName("auto")
        .setDescription(
          "Whether to setup the bot automatically (true) or to create an intrecative prompt (false)",
        )
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_GUILD"],
    userLevel: 4,
    client: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
  },
  run: async (interaction) => {
    if (!interaction.options.getBoolean("auto"))
      return interaction.reply({
        content:
          "The manual process is not available yet. Please use the automatic one or wait for the next version",
        ephemeral: true,
      });

    const embed = new MessageEmbed()
      .setTitle("Automatic setup")
      .setFooter({ text: "AntiRaid" });
    interaction.reply({ embeds: [embed] });

    let description = "";
    const sendUpdate = async (text) => {
      description += `\n${text}`;
      await wait(2000);
      embed.setDescription(description);
      interaction.editReply({ embeds: [embed] });
    };

    servers
      .findOne({ guildID: interaction.guild.id })
      .then(async (res, err) => {
        if (err)
          return await sendUpdate(
            "Anti-Raid ran into an error. Please try again later",
          );
        if (!res) res = new servers({ guildID: interaction.guild.id });
        if (!res.mutedrole) {
          await sendUpdate("🔄 No muted role. Creating...");
          interaction.guild.roles
            .create({
              name: "Muted",
              color: "RED",
              permissions: [],
              reason: "Automatic Setup - Creating Muted Role",
            })
            .then(async (role) => {
              res.mutedrole = role.id;
              await sendUpdate("✅ Created Muted role. Editing permissions...");
              interaction.guild.channels.cache.each((channel) => {
                channel.permissionOverwrites.create(
                  role,
                  {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    EMBED_LINKS: false,
                    ATTACH_FILES: false,
                    CONNECT: false,
                  },
                  {
                    reason: "Updating channel permissions for muted role",
                  },
                );
              });
              res.save();
              await sendUpdate("✅ Muted role permissions set successfully. ");
            });
        }
      });
  },
};
