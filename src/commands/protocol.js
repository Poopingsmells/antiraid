const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const protocls = require("../models/protocols");
const mongoose = require("mongoose");
module.exports = {
  category: "owner",
  data: new SlashCommandBuilder()
    .setName("protocol")
    .setDescription("Execute one of AntiRaid's protocols")
    .addStringOption((str) =>
      str
        .setName("protocol")
        .setRequired(true)
        .setDescription("Activate what protocol")
        .addChoice("Protocol 1 (Maintenance)", "1")
        .addChoice("Protocol 2 (Under Attack)", "2")
        .addChoice("Protocol 3 (Disconnect Database)", "3"),
    ),
  requirements: {
    user: [],
    userLevel: 10,
  },
  ownerOnly: false,
  run: (interaction) => {
    const protocol_number = interaction.options.getString("protocol");
    console.log(protocol_number);
    protocls.findOne({}, async (err, data) => {
      if (!data) {
        const newdata = new data({
          protocol_1: false,
          protocol_2: false,
          protocol_3: false,
        });
        newdata.save();
      }
      if (data) {
        if (protocol_number == 1) {
          if (data.protocol_1 == false) {
            data.protocol_1 = true;
            data.save();
            interaction.reply({
              embeds: [
                new MessageEmbed()
                  .setColor("PURPLE")
                  .setDescription("Protocol 1 is activated ✅"),
              ],
            });
            client.removeListener(Events.InteractionCreate);
            console.log("guh");
          } else if (data.protocol_1 == true) {
            data.protocol_1 = false;
            data.save();
            interaction.reply({
              embeds: [
                new MessageEmbed()
                  .setColor("PURPLE")
                  .setDescription("Protocol 1 is deactivated ✅"),
              ],
            });
          }
        }
        if (protocol_number == 2) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("PURPLE")
                .setDescription(
                  "Protocol 2 is activated ✅\nShutting down client in 7 seconds",
                ),
            ],
          });
          setTimeout(() => {
            interaction.client.destroy();
          }, 7000);
        }
        if (protocol_number == 3) {
          mongoose.disconnect();
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("PURPLE")
                .setDescription("Protocol 3 is activated ✅"),
            ],
          });
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("PURPLE")
                .setDescription("Protocol 3 is deactivated ✅"),
            ],
          });
        }
      }
    });
  },
};
