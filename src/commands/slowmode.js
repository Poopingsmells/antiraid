const servers = require("../models/servers");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode to a channel")
    .addChannelOption((ch) =>
      ch
        .setName("channel")
        .setDescription("The channel you wish to apply slowmode")
        .setRequired(true),
    )
    .addStringOption((str) =>
      str
        .setName("type")
        .setDescription("Hours / Minutes or Seconds")
        .addChoice("Hours", "h")
        .addChoice("Minutes", "m")
        .addChoice("Seconds", "s")
        .setRequired(true),
    )
    .addIntegerOption((time) =>
      time
        .setName("time")
        .setDescription("The slowmode time per user to be set for that channel")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_GUILD"],
    userLevel: 4,
    client: ["MANAGE_CHANNELS"],
  },
  run: async (interaction) => {
    const time = interaction.options.getInteger("time");
    const option = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");
    const hours = time * 3600;
    const minutes = time * 60;
    const seconds = time * 1;
    if (option === "m") {
      channel.setRateLimitPerUser(
        minutes,
        "Set by - [" + interaction.user.tag + "]",
      );
    }
    if (option === "h") {
      if (time > 6)
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription(":x: Time can't be longer than 6 hours"),
          ],
        });
      channel.setRateLimitPerUser(
        hours,
        "Set by - [" + interaction.user.tag + "]",
      );
    }
    if (option === "s") {
      channel.setRateLimitPerUser(
        seconds,
        "Set by - [" + interaction.user.tag + "]",
      );
    }
    interaction.reply(
      "⏳ Successfully added slowmode with " +
        time +
        option +
        " per message , at **" +
        channel.name +
        "**",
    );
    servers.findOne(
      {
        guildID: interaction.guild.id,
      },
      (err, res) => {
        const channel1 = interaction.guild.channels.cache.get(res.mod);
        if (channel1) {
          channel1.send(
            "⏳ Slowmode has been set with " +
              time +
              option +
              " per message , at **" +
              channel.name +
              "**" +
              " by ``" +
              interaction.user.tag +
              "``",
          );
        }
      },
    );
  },
};
