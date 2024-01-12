/* eslint-disable max-nested-callbacks */
/* eslint-disable no-undef */
const { MessageEmbed } = require("discord.js");
const cases = require("../models/cases");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("Returns cases information about a user")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("The user you want to check cases of")
        .setRequired(true),
    ),
  requirements: {
    user: ["MANAGE_SERVER"],
    userLevel: 3,
  },
  run: (interaction) => {
    let member = interaction.options.getUser("user");
    member = interaction.user;
    cases.findOne(
      {
        serverId: interaction.guild.id,
        targetId: member.id,
      },
      (err, res) => {
        cases.find(
          {
            serverId: interaction.guild.id,
            targetId: member.id,
          },
          (err, Numbers) => {
            cases.find(
              {
                serverId: interaction.guild.id,
                action: "Ban",
                targetId: member.id,
              },
              (err, ban) => {
                cases.find(
                  {
                    serverId: interaction.guild.id,
                    action: "SoftBan",
                    targetId: member.id,
                  },
                  (err, soft) => {
                    cases.find(
                      {
                        serverId: interaction.guild.id,
                        action: "Kick",
                        targetId: member.id,
                      },
                      (err, kick) => {
                        cases.find(
                          {
                            serverId: interaction.guild.id,
                            action: "Warn",
                            targetId: member.id,
                          },
                          (err, warns) => {
                            cases.find(
                              {
                                serverId: interaction.guild.id,
                                action: "Mute",
                                targetId: member.id,
                              },
                              (err, mute) => {
                                cases.find(
                                  {
                                    serverId: interaction.guild.id,
                                    action: "Unmute",
                                    targetId: member.id,
                                  },
                                  (err, unmute) => {
                                    cases.find(
                                      {
                                        serverId: interaction.guild.id,
                                        action: "HackBan",
                                        targetId: member.id,
                                      },
                                      (err, hackban) => {
                                        cases.find(
                                          {
                                            serverId: interaction.guild.id,
                                            action: "UnBan",
                                            targetId: member.id,
                                          },
                                          (err, unban) => {
                                            cases.find(
                                              {
                                                serverId: interaction.guild.id,
                                                action: "TempMute",
                                                targetId: member.id,
                                              },
                                              (err, tmute) => {
                                                cases.find(
                                                  {
                                                    serverId:
                                                      interaction.guild.id,
                                                    action: "TempBan",
                                                    targetId: member.id,
                                                  },
                                                  (err, tban) => {
                                                    if (!res) {
                                                      const embed2 =
                                                        new MessageEmbed()
                                                          .setColor("RED")
                                                          .setDescription(
                                                            "❌ That user does not have cases at this server!",
                                                          );
                                                      return interaction.reply({
                                                        embeds: [embed2],
                                                      });
                                                    }
                                                    let ucases = "";
                                                    for (
                                                      i = 0;
                                                      i < Numbers.length;
                                                      i++
                                                    ) {
                                                      ucases += `**${Numbers[i].case}** ,`;
                                                    }
                                                    let uwarn = "";
                                                    let ukick = "";
                                                    let uban = "";
                                                    let umute = "";
                                                    let uunmute = "";
                                                    let usoft = "";
                                                    let hban = "";
                                                    let unban1 = "";
                                                    let tmutes = "";
                                                    let tbans = "";
                                                    if (!warns) {
                                                      uwarn = "0";
                                                    } else {
                                                      uwarn = warns.length;
                                                    }
                                                    if (!mute) {
                                                      umute = "0";
                                                    } else {
                                                      umute = mute.length;
                                                    }
                                                    if (!kick) {
                                                      ukick = "0";
                                                    } else {
                                                      ukick = kick.length;
                                                    }
                                                    if (!ban) {
                                                      uban = "0";
                                                    } else {
                                                      uban = ban.length;
                                                    }
                                                    if (!unmute) {
                                                      uunmute = "0";
                                                    } else {
                                                      uunmute = unmute.length;
                                                    }
                                                    if (!soft) {
                                                      usoft = "0";
                                                    } else {
                                                      usoft = soft.length;
                                                    }
                                                    if (!hackban) {
                                                      hban = "0";
                                                    } else {
                                                      hban = hackban.length;
                                                    }
                                                    if (!unban) {
                                                      unban1 = "0";
                                                    } else {
                                                      unban1 = unban.length;
                                                    }
                                                    if (!tmute) {
                                                      tmutes = "0";
                                                    } else {
                                                      tmutes = tmute.length;
                                                    }
                                                    if (!tban) {
                                                      tbans = "0";
                                                    } else {
                                                      tbans = tban.length;
                                                    }
                                                    const embed =
                                                      new MessageEmbed()
                                                        .setTitle(
                                                          "📃 " +
                                                            member.username +
                                                            " Cases ",
                                                          member.displayAvatarURL(
                                                            { dynamic: true },
                                                          ),
                                                        )
                                                        .addField(
                                                          "Kick(s)",
                                                          ukick,
                                                          true,
                                                        )
                                                        .addField(
                                                          "Ban(s)",
                                                          uban,
                                                          true,
                                                        )
                                                        .addField(
                                                          "SoftBan(s)",
                                                          usoft,
                                                          true,
                                                        )
                                                        .addField(
                                                          "Warn(s)",
                                                          uwarn,
                                                          true,
                                                        )
                                                        .addField(
                                                          "Mute(s)",
                                                          umute,
                                                          true,
                                                        )
                                                        .addField(
                                                          "Unmute(s)",
                                                          uunmute,
                                                          true,
                                                        )
                                                        .addField(
                                                          "HackBan(s)",
                                                          hban,
                                                          true,
                                                        )
                                                        .addField(
                                                          "UnBan(s)",
                                                          unban1,
                                                          true,
                                                        )
                                                        .addField(
                                                          "TempMute(s)",
                                                          tmutes,
                                                          true,
                                                        )
                                                        .addField(
                                                          "TempBan(s)",
                                                          tbans,
                                                          true,
                                                        )
                                                        .addField(
                                                          "All User Cases!, Do **case <number>** to view it",
                                                          `${ucases}`,
                                                        )
                                                        .setFooter({
                                                          text:
                                                            "Requested by " +
                                                            message.author.tag,
                                                          iconURL:
                                                            message.author.displayAvatarURL(
                                                              { dynamic: true },
                                                            ),
                                                        });
                                                    interaction.reply({
                                                      embeds: [embed],
                                                    });
                                                  },
                                                );
                                              },
                                            );
                                          },
                                        );
                                      },
                                    );
                                  },
                                );
                              },
                            );
                          },
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  },
};
