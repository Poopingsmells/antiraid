/* eslint-disable no-unused-vars */
/* eslint-disable no-octal */
const { MessageEmbed, CommandInteraction } = require("discord.js");
const servers = require("../models/servers");
const cases = require("../models/cases");
const CLOCK = require("../models/clock");
const moment = require("moment");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a server member")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("The user to be muted")
        .setRequired(true),
    )
    .addStringOption((str) =>
      str.setName("reason").setDescription("The reason for the mute"),
    ),
  guildOnly: true,
  requirements: {
    user: ["MANAGE_CHANNELS"],
    client: ["MANAGE_CHANNELS", "MANAGE_NICKNAMES"],
    userLevel: 2,
  },
  /**
   * @param {servers} servers
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const member1 = interaction.options.getMember("user");
    const user1 = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No Reason Provided by Staff!";
    servers.findOne(
      {
        guildID: interaction.guild.id,
      },
      async (err, data) => {
        if (data.mutedrole === "String") {
          return interaction.reply({
            content:
              "❌ You should configure a muted role via the dashboard <https://antiraid.xyz/>",
            ephemeral: true,
          });
        }
        if (!interaction.guild.roles.cache.get(data.mutedrole)) {
          return interaction.reply({
            content:
              "❌ I can't find the mute role, try setting another one from dashboard <https://antiraid.xyz/>",
            ephemeral: true,
          });
        }
        CLOCK.findOne(
          {
            userID: member1.user.id,
            action: "Mute",
            serverID: interaction.guild.id,
          },
          async (err, res) => {
            if (res) {
              return interaction.reply({
                content: `:x: **${member1.user.tag}** is already muted!`,
                ephemeral: true,
              });
            } else {
              if (
                member1.roles.highest.position >=
                interaction.member.roles.highest.position
              ) {
                return interaction.reply({
                  content:
                    "❌ You can't mute a person that has a higher role | the same roles than you.",
                  ephemeral: true,
                });
              }
              const role1 = interaction.guild.roles.cache.get(data.mutedrole);
              if (role1.position >= interaction.guild.me.roles.highest.position)
                return interaction.reply({
                  content: "Mute role is higher than my role or same to me!",
                  ephemeral: true,
                });
              member1.roles
                .add(role1)
                .catch(console.error)
                .then(
                  interaction.reply(
                    "🔇 Successfully Muted **" +
                      member1.user.tag +
                      "** , Reason: ``" +
                      reason +
                      "``",
                  ),
                );
              member1.setNickname(`[Muted] - ${member1.user.username}`);
              const newaction = new CLOCK({
                userID: member1.user.id,
                time: 00000,
                timenow: 00000,
                action: "Mute",
                serverID: interaction.guild.id,
              });
              await newaction.save();
              servers.findOne(
                {
                  guildID: interaction.guild.id,
                },
                (err, res2) => {
                  if (res2) {
                    const channel = interaction.guild.channels.cache.get(
                      res2.mod,
                    );
                    if (channel) {
                      channel.send(
                        "🔇 ``" +
                          member1.user.tag +
                          "`` has been muted by ``" +
                          interaction.user.tag +
                          "`` , Reason: ``" +
                          reason +
                          "``",
                      );
                    }
                  }
                },
              );

              cases
                .find({
                  serverId: interaction.guild.id,
                })
                .sort([["descending"]])
                .exec((err, res) => {
                  const cases1 = new cases({
                    targetId: member1.user.id,
                    reason: reason,
                    type: "Mute",
                    modId: interaction.user.id,
                    serverId: interaction.guild.id,
                    caseId: res.length + 1,
                  });
                  cases1.save();
                  const embed = new MessageEmbed()
                    .setTitle(
                      `${interaction.guild.name} | Mute`,
                      interaction.guild.iconURL({ dynamic: true }),
                    )
                    .setColor("RED")
                    .setDescription(
                      `Case Number: \`#${res.length}\` \nModerator: **${interaction.user.tag}** (\`${interaction.user.id}\`) \nAllegation: **${member1.user.tag}** (\`${member1.user.id}\`)`,
                    )
                    .addField("**Reason**", reason)
                    .setFooter({
                      text: moment(interaction.createdAt).format(
                        "MM/DD/YYYY HH:mm:ss A",
                      ),
                    });
                  // eslint-disable-next-line no-empty-function
                  user1.send({ embeds: [embed] });
                });
            }
          },
        );
      },
    );
  },
};

// need fixx
/**
 * // const CLOCK = require('../models/clock');
// const servers = require('../models/servers');
// const { MessageEmbed } = require('discord.js');
// const cases = require('../models/cases');
// const moment = require('moment');

// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args) => {
//     if(!args[0]) return message.reply("**❌ Please provide a user for the action!**")
//     if(!args[1]) return message.reply("**❌ Please provide time (amount[minutes - hour - day - week])**")
//     let tempuser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
//     if(!tempuser) return message.reply("Seems like i can't find that user!")
//     if(!message.guild.members.cache.get(tempuser.user.id)) return message.reply("Seems like i can't find that user!")
//     let usertime = require("ms")(args[1])
//     if(usertime == undefined) return message.reply("Unknown date format try use (1m - 1h - 1d - 1w)")
//     if(usertime <= 180000) return message.reply("Time can't be less or equal to 3 minutes!")
//     let reason = args.slice(2).join(" ")
//     if(!reason) reason = 'No reason provided!'
//     if(tempuser.roles.highest.position >= message.member.roles.highest.position){
//         return message.channel.send("❌ You can't temp mute person have roles higher than or same to you!")
//     }
//     servers.findOne({
// guildID: message.guild.id}, async (err, serverman) => {
//     if(!serverman) return message.reply("Error occured while excuting command!")
//     let role = message.guild.roles.cache.get(serverman.mutedrole)
//     if(!role) return message.reply("Seems like i can't find the mute role for this server or you didn't set up it!")
// CLOCK.findOne({
//     userID: tempuser.user.id,
//     action: "TempMute",
//     serverID: message.guild.id}, async (err, res) => {
// if(res) {
//     return message.reply(`:x: **${tempuser.user.tag}** is already temp muted!`)
// }else{
// let newaction = new CLOCK({
//     userID: tempuser.user.id,
//     time: usertime,
//     timenow: Date.now(),
//     action: "TempMute",
//     serverID: message.guild.id
// })
// await newaction.save()
// cases.find({
//     serverID: message.guild.id
//         }).sort([
//           ['descending']
//         ]).exec((err, res1) => {
//     let cases1 = new cases({
//         userID: tempuser.user.id,
//         reason: reason,
//         action: "TempMute",
//         Moderator: message.author.id,
//         serverID: message.guild.id,
//         time: moment(message.createdAt).format('MM/DD/YYYY HH:mm:ss A'),
//         case: res1.length + 1,
//         duration: args[1]
//     })
//     cases1.save()
//     let embed = new MessageEmbed()
//     .setTitle(`${message.guild.name} | TempMute`, message.guild.iconURL({dynamic: true}))
//     .setColor("RED")
//     .setDescription(`Case Number: \`#${res1.length}\` \nModerator: **${message.author.tag}** (\`${message.author.id}\`) \nAllegation: **${tempuser.user.tag}** (\`${tempuser.user.id}\`) \nDuration: \`${args[1]}\` `)
//     .addField("**Reason**", reason)
//     .setFooter({text: (moment(message.createdAt).format('MM/DD/YYYY HH:mm:ss A'))
//     tempuser.user.send(embed).catch(() => {})
// })
// let member = message.guild.members.cache.get(tempuser.user.id)
// member.roles.add(role)
// .catch(() => {})
// .then(() => {message.channel.send(`🔇 Successfully **${tempuser.user.tag}** has been temp muted for **${args[1]}** !\nReason: **${reason}**`)})
// let channel = message.guild.channels.cache.get(serverman.mod)
// if(channel) {
//     channel.send(`🔇 **${tempuser.user.tag}** has been temp muted for ${args[1]} ! , by **${message.author.tag}**\nReason: **${reason}**`)
// }
// }
// })
// })
	message.channel.send('Temporary disabled until we fix some issues with them :)');
};
module.exports.help = {
	name: 'tempmute',
	category: 'moderation',
	aliases: ['tmute'],
	description: 'Temp mute user and unmute him after period of time!',
	example: '``tempmute <@user> <time(m - h - d - w)> [reason]``',
};

module.exports.requirements = {
	userPerms: ['MUTE_MEMBERS'],
	clientPerms: ['MANAGE_ROLES'],
	ownerOnly: false,
};

module.exports.limits = {
	rateLimit: 2,
	cooldown: 1e4,
};

 */
