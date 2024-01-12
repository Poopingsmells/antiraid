/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const moment = require("moment");
const ms = require("ms");
const osu = require("node-os-utils");
const os = require("os");

module.exports = {
  category: "info",
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows bot stats")
    .addStringOption((type) =>
      type
        .setName("type")
        .setDescription("Which stats to show")
        .addChoice("General information", "info")
        .addChoice("System information", "system")
        .setRequired(true),
    ),
  description: "Sends statistics about the bot",
  /**
   * @param {CommandInteraction} interaction
   */
  run: async (interaction) => {
    const type = interaction.options.getString("type");
    if (!type || !["info", "system"].includes(type))
      return interaction.reply({
        content: "You specified an invalid statistics category",
        ephemeral: true,
      });
    const cpu = osu.cpu;
    const mem = osu.mem;

    const promises = [
      client.shard.fetchClientValues("guilds.cache.size"),
      client.shard.broadcastEval((c) =>
        c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      ),
    ];

    return Promise.all(promises).then((results) => {
      const guilds = results[0].reduce(
        (acc, guildCount) => acc + guildCount,
        0,
      );
      const members = results[1].reduce(
        (acc, memberCount) => acc + memberCount,
        0,
      );
      cpu.usage().then(async (cpuPercentage) => {
        mem.info().then(async (minfo) => {
          if (type === "info" || type === "information") {
            const embed = new MessageEmbed()
              .setTitle(
                "Bot stats",
                interaction.client.user.displayAvatarURL({ dynamic: true }),
              )
              .addField("Name:", interaction.client.user.username, true)
              .addField("ID:", interaction.client.user.id, true)
              .addField("Ping", interaction.client.ws.ping + " ms", true)
              .addField(
                "Uptime",
                ms(interaction.client.uptime, { long: true }),
                true,
              )
              .addField("Servers", guilds, true)
              .addField("Users", users, true)
              .addField("Channels (Total)", "0", true)
              .addField(
                "Emojis",
                interaction.client.emojis.cache.size.toString(),
                true,
              )
              .addField(
                "Created At",
                moment(interaction.client.user.createdAt).format(
                  "dddd, MMMM Do YYYY, h:mm:ss a",
                ),
                true,
              )
              .addField(
                "Last Restart",
                moment(interaction.client.readyAt).format(
                  "dddd. MMMM Do YYYY, h:mm:ss zz",
                ),
                true,
              )
              .setThumbnail(interaction.client.user.displayAvatarURL())
              .setColor("DARK_BLUE");
            interaction.reply({ embeds: [embed] });
          } else if (type === "system") {
            const embed = new MessageEmbed()
              .setTitle(
                "System Information",
                interaction.client.user.displayAvatarURL({ dynamic: true }),
              )
              .addField(
                "OS",
                `**Name:** ${interaction.client.utils.toProperCase(
                  process.platform,
                )}\n**Version:** ${os.release()}`,
                true,
              )
              .addField("CPU", `${cpuPercentage}%`, true)
              .addField("Memory", `${minfo.usedMemMb} MB`, true)
              .addField("Discord.JS", `v${require("discord.js").version}`, true)
              .addField("NodeJS", process.version, true)
              .addField(
                "Mongoose (Database)",
                `v${require("mongoose").version}`,
                true,
              )
              .setThumbnail(interaction.client.user.displayAvatarURL())
              .setColor("DARK_RED");
            interaction.reply({ embeds: [embed] });
          }
        });
      });
    });
  },
};
