const { SlashCommandBuilder } = require("@discordjs/builders");
const servers = require("../models/servers");

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks a channel")
    .addChannelOption((channel) =>
      channel
        .setName("channel")
        .setDescription(
          "The channel to lock. The current one will be used if no channel is specified.",
        ),
    )
    .addMentionableOption((target) =>
      target
        .setName("target")
        .setDescription(
          "The role or member for which to lock the channel. Leave blank to lock for everyone",
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
        SEND_MESSAGES: false,
        EMBED_LINKS: false,
        ADD_REACTIONS: false,
        USE_APPLICATION_COMMANDS: false,
        READ_MESSAGE_HISTORY: false,
        CONNECT: false,
        SPEAK: false,
        CREATE_INSTANT_INVITE: false,
        STREAM: false,
        USE_PUBLIC_THREADS: false,
        ATTACH_FILES: false,
        USE_EXTERNAL_EMOJIS: false,
        VIEW_CHANNEL: false,
        USE_PRIVATE_THREADS: false,
        USE_EXTERNAL_STICKERS: false,
      },
      {
        reason: `/lock command used by ${interaction.user.tag}`,
      },
    );
    servers.findOne(interaction.guild.id, (_err, res) => {
      const channel1 = interaction.guild.channels.cache.get(res.mod);
      if (channel1) {
        channel1.send({
          content:
            "🔒 `" +
            channel.name +
            "` was locked by ``" +
            interaction.user.tag +
            "``",
        });
      }
    });
    interaction.reply({
      content: "🔒 Successfully locked `" + channel.name + "` !",
    });
  },
};
