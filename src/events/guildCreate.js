const servers = require("../models/servers.js");
const { MessageEmbed } = require("discord.js");
const generator = require("generate-password");

module.exports = {
  name: "guildCreate",
  run: async (client, guild) => {
    // client.lists.ibl(client.servers.cache.length, 1);
    // client.lists.fates(client.servers.cache.length, 1, client.users.cache.length);
    const key = generator.generate({
      length: 10,
      uppercase: false,
      numbers: true,
      excludeSimilarCharacters: true,
    });
    const channelset = new servers({
      guildID: guild.id,
      // channels
      welcomeChannel: "String",
      leaveChannel: "String",
      mod: "String",
      audit: "String",
      CanLockChannels: "String",
      // roles
      mutedrole: "String",
      botautorole: "String",
      autorole: "String",
      // important settings
      key: "String",
      antispam: "0", // 0: no antispam, 1: basic, 2: moderate, 3: severe
      moderateLinks: false,
      moderateProfanity: false,
      moderateWebhooks: false,
      warnsForKick: null,
      warnsForBan: null,
      warnsForMute: null,
      // saved messages
      welcomeMsg: "String",
      leaveMsg: "String",
      EmbedsForJoinLeave: "String",
      AntiRaid: "0",
    });
    channelset.save();
    try {
      client.users.cache.get(guild.ownerId).send({
        embeds: [
          new MessageEmbed()
            .setTitle("Thank you for inviting Anti-raid")
            .setDescription(
              "Anti-Raid is a powerful moderation bot to secure your server.\nTo edit your server settings, head to the bot's [Dashboard](https://antiraid.xyz)\nYou will find a key in this embed that will allow you to restore access to your regain control of Anti-Raid if you lose access to your owner account.",
            )
            .addField(
              "Your key **NEVER SHARE IT**",
              `||${key}|| (click on the gray rectangle to view it)`,
            ),
        ],
      });
      // this may make the bot kicked from some servers. guild.channels.permissionsFor(message.guild.me).has('SEND_MESSAGES').random().send(new MessageEmbed().setColor('PURPLE').setAuthor('Thanks For Inviting Me!', client.user.displayAvatarURL()).setDescription(`Hello, im thankful you invited me to your beautiful server! :) My prefix is \`${client.config.def_prefix}\``));
      // eslint-disable-next-line no-empty
    } catch (err) {}
    const embed = new MessageEmbed()
      .setAuthor({ name: guild.name })
      .setTitle("<:newguild:868069980141404200> | New Guild")
      .setDescription(
        "**ID** × `" +
          guild.id +
          "`\n**Members** × `" +
          guild.memberCount +
          "`\n**Owner** × `" +
          guild.ownerId +
          "`",
      )
      .setColor("GREEN");
    client.channels.cache.get("822795982521237604").send({ embeds: [embed] });
  },
};
