const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const servers = require("../models/servers");
const moment = require("moment");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  requirements: {
    user: ["BAN_MEMBERS"],
    userLevel: 3,
    client: ["BAN_MEMBERS"],
  },
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The id of the user to unban")
        .setRequired(true),
    )
    .addStringOption((reason) =>
      reason.setName("reason").setDescription("The reason for the unban"),
    ),
  run: async (interaction) => {
    let reason = interaction.options.getString("reason");
    if (!reason) reason = "No reason specified";
    const target = interaction.options.getString("id");
    const targetId = Number(target);
    if (target.length !== 18) {
      return interaction.reply({ content: "❌ That's not a valid id!" });
    }

    const guildBans = await interaction.guild.bans.fetch();
    if (
      (guildBans.id && guildBans.id !== targetId) ||
      !guildBans.has(targetId)
    ) {
      // const banuser = await interaction.client.users.fetch(targetId);
      const banuser = undefined;
      interaction.guild.members.unban(target);
      interaction.reply({
        content: `✅ Successfully unbanned **${
          banuser ? banuser.tag : targetId
        }** from this server!`,
      });
      servers.findOne({ guildID: interaction.guild.id }, (err, res) => {
        const channel = interaction.guild.channels.cache.get(res.mod);
        if (channel) {
          channel.send({
            content: `✅ ${
              banuser ? banuser.tag : targetId
            } was unbanned by **${interaction.user.tag}**`,
          });
        }
      });
      cases
        .find({
          serverID: interaction.guild.id,
        })
        .sort([["descending"]])
        .exec((err, res) => {
          const cases1 = new cases({
            userID: targetId,
            reason: reason,
            action: "Unban",
            Moderator: interaction.user.id,
            serverID: interaction.guild.id,
            time: moment(interaction.createdAt).format("DD/MM/YYYY HH:mm:ss A"),
            case: res.length + 1,
          });
          cases1.save();
          const embed = new MessageEmbed()
            .setTitle(
              `${interaction.guild.name} | Unban`,
              interaction.guild.iconURL({ dynamic: true }),
            )
            .setColor("GREEN")
            .setDescription(
              `Case Number: \`#${res.length + 1}\` \nModerator: **${
                interaction.user.tag
              }** (\`${interaction.user.id}\`) \nAllegation: **${
                banuser.tag
              }** (\`${targetId}\`)`,
            )
            .setFooter({
              text: moment(interaction.createdAt).format(
                "MM/DD/YYYY HH:mm:ss A",
              ),
            });
          if (banuser)
            banuser.send({ embeds: [embed] }).catch(() =>
              interaction.editReply({
                content: `✅ Successfully unbanned **${
                  banuser ? banuser.tag : targetId
                }** from this server, but I was unable to notify him by DM`,
              }),
            );
        });
    } else {
      return interaction.reply({ content: "That user is not banned!" });
    }
  },
};

module.exports.help = {
  name: "unban",
  category: "moderation",
  aliases: ["uban"],
  description: "Unban user from the server!",
  example: "``unban <userguildID>``",
};

module.exports.requirements = {
  userPerms: ["BAN_MEMBERS"],
  clientPerms: ["BAN_MEMBERS"],
  ownerOnly: false,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
