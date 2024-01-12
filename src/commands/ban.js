const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const servers = require("../models/servers");
const moment = require("moment");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  category: "modration",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption((user) =>
      user
        .setName("target")
        .setDescription("The user to ban")
        .setRequired(true),
    )
    .addBooleanOption((dm) =>
      dm
        .setName("dm")
        .setDescription("Whether to dm the user")
        .setRequired(true),
    )
    .addBooleanOption((soft) =>
      soft.setName("softban").setDescription("Whether to softban the user"),
    )
    .addStringOption((reason) =>
      reason.setName("reason").setDescription("The reason for the ban"),
    )
    .addStringOption((time) =>
      time
        .setName("duration")
        .setDescription("If you want to temp-ban, the duration of the ban"),
    ),
  requirements: {
    user: ["BAN_MEMBERS"],
    client: ["BAN_MEMBERS"],
  },
  run: async (interaction) => {
    const member = interaction.options.getMember("target");
    const user = interaction.options.getUser("target");
    let dm = interaction.options.getBoolean("dm");
    const soft = interaction.options.getBoolean("softban");
    const time = interaction.options.getString("duration");
    if (time)
      return interaction.reply({
        content:
          "The temp-ban option has been temporarily disbed for a bug fix. Sorry for the inconvenience",
        ephemeral: true,
      });
    const guildBans = await interaction.guild.bans.fetch();
    if ((guildBans.id && guildBans.id === user.id) || guildBans.has(user.id)) {
      return interaction.reply({ content: "❌ That user is already banned!" });
    }
    if (
      member?.roles &&
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "❌ You can't ban a member that has a higher or same role level as you.",
      });
    }
    if (member.permissions.has("ADMINISTRATOR"))
      interaction.reply({ content: "❌ You cannot ban an admin" });
    let reason = interaction.options.getString("reason");
    if (!reason) {
      reason = "No reason provided";
    }
    const id = member.id;
    cases
      .find({
        serverID: interaction.guild.id,
      })
      .sort([["descending"]])
      .exec((err, res) => {
        const cases1 = new cases({
          userID: member.id,
          reason: reason,
          action: "Ban",
          Moderator: interaction.user.id,
          serverID: interaction.guild.id,
          time: moment(interaction.createdAt).format("MM/DD/YYYY HH:mm:ss A"),
          case: res.length + 1,
        });
        cases1.save();
        const embed = new MessageEmbed()
          .setTitle(
            `${interaction.guild.name} | Ban`,
            interaction.guild.iconURL({ dynamic: true }),
          )
          .setColor("RED")
          .setDescription(
            `Case Number: \`#${res.length}\` \nModerator: **${interaction.user.tag}** (\`${interaction.user.id}\`) \nAllegation: **${member.user.tag}** (\`${member.id}\`)`,
          )
          .addField("**Reason**", reason)
          .setFooter({
            text: moment(interaction.createdAt).format("MM/DD/YYYY HH:mm:ss A"),
          });
        if (dm == true)
          member.send({ embeds: [embed] }).catch(() => (dm = false));
      });
    member
      .ban({
        reason: reason,
      })
      .then(() => {
        if (soft) interaction.guild.members.unban(id, "Softban");
        servers.findOne({ guildID: interaction.guild.id }, (err, res) => {
          const channel = interaction.guild.channels.cache.get(res.mod);
          if (channel) {
            channel.send({
              content: `👢 **${user.tag}** has been banned by **${interaction.user.tag}**.\nReason: **${reason}**`,
            });
          }
        });
        const reply = new MessageEmbed()
          .setTitle("👢 | Member Banned")
          .setColor("RED")
          .setDescription(`Successfully banned \`${member.user.tag}\``)
          .addField("Reason", reason, true)
          .addField("User DMed", dm ? "Yes" : "No", true);
        if (soft) reply.addField("Softban", "Yes", true);
        interaction.reply({ embeds: [reply] });
      })
      .catch(() => {
        interaction.reply({
          content:
            "I was unable to ban the member. Check if their roles are higher than mine or if they have administrative permissions!",
        });
      });
  },
};
