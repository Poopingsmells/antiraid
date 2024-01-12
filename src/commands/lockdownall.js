const servers = require("../models/servers");
const { MessageEmbed } = require("discord.js");

const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");

module.exports = {
  category: "moderation",
  data: new SlashCommandBuilder()
    .setName("lockserver")
    .setDescription("Locks the server and no one can type in it!"),
  requirements: {
    user: [],
  },
  ownerOnly: false,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    servers.findOne(
      {
        guildID: interaction.guild.id,
      },
      (err, res) => {
        // eslint-disable-next-line no-unused-vars
        res.CanLockChannels.forEach((x) => {
          const ch = interaction.guild.channels.cache.get(x);
          if (!ch)
            return interaction.reply({
              content: "Couldnt fetch all channels! Try again!",
              ephemeral: true,
            });
          interaction.channel.send(
            new MessageEmbed()
              .setTitle("🔒 | Server Locked Down")
              .setColor("PURPLE")
              .setDescription("I have succesfully locked the server down!"),
          );
          const channel1 = interaction.guild.channels.cache.get(res.mod);
          if (channel1) {
            channel1.send(
              new MessageEmbed()
                .setTitle("🔒 | Server Locked Down")
                .setColor("PURPLE")
                .setDescription(
                  "**" + interaction.user.tag + "** locked the server down!",
                ),
            );
          }
        });
      },
    );
  },
};
// interaction.guild.channels.cache.map(channel => {
// 	channel.updateOverwrite(interaction.guild.id, {
// 		SEND_MESSAGES: false,
// 	});
// });
