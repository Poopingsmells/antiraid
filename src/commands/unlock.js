const { SlashCommandBuilder } = require("@discordjs/builders");
const servers = require("../models/servers");

module.exports = {
  category: "utitlity",
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlocks a channel")
    .addChannelOption((channel) =>
      channel
        .setName("channel")
        .setDescription(
          "The channel to unlock. The current one will be used if no channel is specified.",
        ),
    )
    .addMentionableOption((target) =>
      target
        .setName("target")
        .setDescription(
          "The role or member for which to unlock the channel. Leave blank to unlock for everyone",
        ),
    ),
  guildOnly: true,
  requirements: {
    user: ["MANAGE_CHANNELS"],
    client: ["MANAGE_CHANNELS"],
    userLevel: 2,
  },
  run: (interaction) => {
    const id =
      interaction.options.getMentionable("target") || interaction.guild.id;
    let channel = interaction.options.getChannel("channel");
    if (!channel) channel = interaction.channel;
    channel.permissionOverwrites.create(
      id,
      {
        SEND_MESSAGES: true,
        EMBED_LINKS: true,
        ADD_REACTIONS: true,
        USE_APPLICATION_COMMANDS: true,
        READ_MESSAGE_HISTORY: true,
        CONNECT: true,
        SPEAK: true,
        CREATE_INSTANT_INVITE: true,
        STREAM: true,
        USE_PUBLIC_THREADS: true,
        ATTACH_FILES: true,
        USE_EXTERNAL_EMOJIS: true,
        VIEW_CHANNEL: true,
        USE_PRIVATE_THREADS: true,
        USE_EXTERNAL_STICKERS: true,
      },
      {
        reason: `/unlock command used by ${interaction.user.tag}`,
      },
    );
    servers.findOne({ guildID: interaction.guild.id }, (_err, res) => {
      const channel1 = interaction.guild.channels.cache.get(res.mod);
      if (channel1) {
        channel1.send({
          content:
            "🔓 `" +
            channel.name +
            "` was unlocked by ``" +
            interaction.user.tag +
            "``",
        });
      }
    });
    interaction.reply({
      content: "🔓 Successfully unlocked `" + channel.name + "` !",
    });
  },
};
