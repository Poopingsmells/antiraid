const { MessageEmbed } = require("discord.js");
const custom = require("../models/tags");
const { SlashCommandBuilder } = require("@discordjs/builders");

const subcommands = {
  use: async (interaction) => {
    const name = interaction.options.getString("name");
    custom.findOne(
      {
        GuildID: interaction.guild.id,
        Command: name,
      },
      async (err, data) => {
        if (data) {
          await interaction.reply({ content: data.Content });
        } else {
          await interaction.reply({
            content: "I couldn't find any tag coresponding to that name...",
            ephemeral: true,
          });
        }
      },
    );
  },
  create_text: async (interaction) => {
    const name = interaction.options.getString("name");
    const content = interaction.options.getString("response");
    if (!name) {
      await interaction.reply({
        content: ":warning: You did not specify a custom command name!",
      });
    }
    if (!content) {
      return interaction.reply({ content: ":warning: No content specified!" });
    }
    custom.findOne(
      {
        GuildID: interaction.guild.id,
        Command: name,
      },
      async (err, data) => {
        if (err) throw err;
        if (data) {
          data.Content = content;
          data.save();

          interaction.reply({
            content: `Successfully updated the tag: \`${name}\``,
          });
        } else if (!data) {
          const newData = new custom({
            GuildID: interaction.guild.id,
            Command: name,
            Content: content,
          });
          newData.save();
          interaction.reply({
            content: `Successfully created the tag with name: \`${name}\``,
          });
        }
      },
    );
  },
  create_embed: async (interaction) => {
    const name = interaction.options.getString("name");
    const content = interaction.options.getString("response");
    if (!name) {
      await interaction.reply({
        content: ":warning: You did not specify a custom command name!",
      });
    }
    if (!content) {
      return interaction.reply({ content: ":warning: No content specified!" });
    }
    custom.findOne(
      {
        GuildID: interaction.guild.id,
        Command: name,
      },
      async (err, data) => {
        if (err) throw err;
        if (data) {
          data.Content = content;
          data.save();

          interaction.reply({
            content: `Successfully updated the tag: \`${name}\``,
          });
        } else if (!data) {
          const newData = new custom({
            GuildID: interaction.guild.id,
            Command: name,
            Content: content,
          });
          newData.save();
          interaction.reply({
            content: `Successfully created the tag with name: \`${name}\``,
          });
        }
      },
    );
  },
  list: async (interaction) => {
    const d = await custom.find({
      GuildID: interaction.guild.id,
    });
    const embed = new MessageEmbed()
      .setColor(interaction.client.config.color)
      .setTitle(
        interaction.user.tag,
        interaction.user.displayAvatarURL({ dynamic: true }),
      )
      .setTitle(`All ${interaction.guild.name} Tags With Their Contents`)
      .setDescription(
        `\`Tag Name\` <=> \`Content\`\n${d
          .map((x) => `**${x.Command}** <=> ${x.Content.substr(0, 40)}`)
          .join("\n")}`,
      )
      .setFooter({
        text: "All Contents are shortened to 40 characters to prevent auto new lining",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    interaction.reply({ embeds: [embed] });
  },
  delete: async (interaction) => {
    const name = interaction.options.getString("name");
    custom.findOneAndDelete({
      GuildID: interaction.guild.id,
      Command: name,
    });
    interaction.reply(`The tag \`${name}\` was deleted successfully!`);
  },
};

module.exports = {
  category: "tags",
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Runs a custom command")
    .addSubcommand((use) =>
      use
        .setName("use")
        .setDescription("Send a custom message")
        .addStringOption((tag) =>
          tag
            .setName("name")
            .setDescription("The name of the custom command to run")
            .setRequired(true),
        ),
    )
    .addSubcommand((create) =>
      create
        .setName("create_text")
        .setDescription(
          "Create a new custom tag that replies with normal message",
        )
        .addStringOption((string) =>
          string
            .setName("name")
            .setDescription("The name of the tag!")
            .setRequired(true),
        )
        .addStringOption((str) =>
          str
            .setName("response")
            .setDescription("The content of the tag")
            .setRequired(true),
        ),
    )
    .addSubcommand((embedcr) =>
      embedcr
        .setName("create_embed")
        .setDescription("Creates a new tag that replies with embedded message")
        .addStringOption((string) =>
          string
            .setName("name")
            .setDescription("The name of the tag!")
            .setRequired(true),
        )
        .addStringOption((str) =>
          str
            .setName("title")
            .setDescription("The title of the response embed of the tag")
            .setRequired(true),
        )
        .addStringOption((str) =>
          str
            .setName("description")
            .setDescription("The description of the response embed of the tag")
            .setRequired(true),
        )
        .addStringOption((url) =>
          url
            .setName("url")
            .setDescription(
              "If you want an image attached to the embed please provide a image link! Must be .jpg or .png!",
            ),
        ),
    )
    .addSubcommand((list) =>
      list
        .setName("list")
        .setDescription("Lists all custom commands (tags) for the server"),
    )
    .addSubcommand((delet) =>
      delet
        .setName("delete")
        .setDescription("Delete a custom commands")
        .addStringOption((name) =>
          name
            .setName("name")
            .setDescription("The name of the custom command")
            .setRequired(true),
        ),
    ),
  run: (interaction) => {
    // 		const subcommand = interaction.options.getSubcommand();
    // 		subcommands[subcommand](interaction).catch(() => interaction.reply({ content: 'Something went wrong with the subcommands.', ephemeral: true }));
    interaction.reply({ content: `In re-work` });
  },
};
