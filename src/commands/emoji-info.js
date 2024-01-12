/* eslint-disable no-unused-vars */
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Delete a role in the server")
    .addRoleOption((role) =>
      role.setName("role").setDescription("The role to be deleted"),
    ),
  category: "moderation",
  ownerOnly: true,
  run: async (interaction) => {
    // const emote = args.join(' ');
    // const regex = emote.replace(/^<a?:\w+:(\d+)>$/, '$1');
    // const emoji = message.guild.emojis.cache.find((emj) => emj.name === emote || emj.id === regex);
    // if(!emoji) return message.channel.send('Please provide an emoji from this server');
    // const a = await emoji.fetchAuthor();
    // function checkOrCross(bool) {
    // 	return { Bool: bool ? '✔' : '❌' };
    // }
    // const embed = new MessageEmbed()
    // 	.setDescription(`__${emoji.name.toLowerCase()}__ Information`)
    // 	.setThumbnail(emoji.url)
    // 	.addField('General Information', [
    // 		`**ID:** ${emoji.id}`,
    // 		`**Link:** [Click](${emoji.url})`,
    // 		`**Author:** ${a.tag} (${a.id})`,
    // 		`**Time Created:** ${moment(emoji.createdTimestamp).format('LT')} ${moment(emoji.createdTimestamp).format('LL')} ${moment(emoji.createdTimestamp).fromNow()}`,
    // 		`**Accessible By:** ${emoji.roles.cache.map(x => x.toString()).join(', ') || 'Everyone'}`,
    // 	], true)
    // 	.addField('Other', [
    // 		`**Requires Colons** ${checkOrCross(emoji.requiresColons).Bool}`,
    // 		`**Deletable** ${checkOrCross(emoji.deletable).Bool}`,
    // 		`**Animated** ${checkOrCross(emoji.animated).Bool}`,
    // 		`**Managed** ${checkOrCross(emoji.managed).Bool}`,
    // 	], true);
    // message.channel.send(embed);
  },
};
