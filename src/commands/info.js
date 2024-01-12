/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/* eslint-disable no-unreachable */
const { SlashCommandBuilder, time } = require("@discordjs/builders");
const AntiEmbed = require("../Functions/AntiEmbed");
// eslint-disable-next-line no-unused-vars
const { CommandInteraction, Permissions, Role } = require("discord.js");
const USERS = require("../models/users");
const cases = require("../models/cases");
const moment = require("moment");

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription(
      "Gives information about a user, a channel, a role or the server",
    )
    .addSubcommand((channel) =>
      channel
        .setName("channel")
        .setDescription("Gives information about a channel")
        .addChannelOption((channelOption) =>
          channelOption
            .setName("channel")
            .setDescription("The channel to send info about")
            .setRequired(true),
        ),
    )
    .addSubcommand((user) =>
      user
        .setName("user")
        .setDescription("Gives information about a user")
        .addUserOption((userOption) =>
          userOption
            .setName("user")
            .setDescription("The user to send info about")
            .setRequired(true),
        ),
    )
    .addSubcommand((role) =>
      role
        .setName("role")
        .setDescription("Gives information about a role")
        .addRoleOption((roleOption) =>
          roleOption
            .setName("role")
            .setDescription("The role to send info about")
            .setRequired(true),
        )
        .addStringOption((str) =>
          str
            .setName("type")
            .setDescription(
              "Select type of info you want to receive for that role",
            )
            .setRequired(true)
            .addChoice("Regular Info", "info")
            .addChoice("Permissions", "perms"),
        ),
    )
    .addSubcommand((server) =>
      server
        .setName("server")
        .setDescription("Gives information about this server"),
    )
    .addSubcommand((emoji) =>
      emoji
        .setName("emoji")
        .setDescription("The emoji to send info about")
        .addStringOption((emj) =>
          emj
            .setName("name")
            .setDescription("The emoji name")
            .setRequired(true),
        ),
    ),
  /**
   * @param {CommandInteraction} interaction
   * @param {Role} role
   */
  run: (interaction) => {
    function checkOrCross(bool) {
      return { Bool: bool ? "✔" : "❌" };
    }
    const embed = new AntiEmbed(interaction.client);
    const getInfoOnThat = interaction.options.getSubcommand();
    embed.setTitle(
      `${interaction.client.utils.toProperCase(getInfoOnThat)} info`,
    );
    const channel = interaction.options.getChannel("channel");
    const emote = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");
    const type = interaction.options.getString("type");
    switch (getInfoOnThat) {
      case "channel":
        if (channel.id) embed.addField("Channel ID", channel.id, true);
        if (channel.name) embed.addField("Channel name", channel.name, true);
        if (channel.type)
          embed.addField(
            "Channel type",
            interaction.client.utils.formatPerms(channel.type),
            true,
          );
        if (channel.parent?.name)
          embed.addField("Parent channel", channel.parent?.name, true);
        if (channel.nsfw)
          embed.addField("NSFW", channel.nsfw ? "Yes" : "No", true);
        if (channel.createdAt)
          embed.addField(
            "Created",
            `${time(channel.createdAt)} (${time(channel.createdAt, "R")})`,
          );
        break;
      // default:
      // 	embed.setTitle('This command is temporarily disabled.').setDescription('Only `/info channel` is enabled right now.');
      // 	break;
      case "emoji":
        const emoji = interaction.guild.emojis.cache.find(
          (emj) => emj.name === emote,
        );
        // if(!emoji) return interaction.reply({ content:'Please provide an emoji from this server', ephemeral: true });
        // const a = emoji.fetchAuthor();
        const embed2 = new AntiEmbed(interaction.client)
          // .setDescription(`__${emoji.name.toLowerCase()}__ Information`)
          // .setThumbnail(emoji.url)
          // .addField('General Information', [
          // 	`**ID:** ${emoji.id}`,
          // 	`**Link:** [Click](${emoji.url})`,
          // 	`**Author:** ${a.tag} (${a.id})`,
          // 	`**Time Created:** ${moment(emoji.createdTimestamp).format('LT')} ${moment(emoji.createdTimestamp).format('LL')} ${moment(emoji.createdTimestamp).fromNow()}`,
          // 	`**Accessible By:** ${emoji.roles.cache.map(x => x.toString()).join(', ') || 'Everyone'}`,
          // ], true)
          // .addField('Other', [
          // 	`**Requires Colons** ${checkOrCross(emoji.requiresColons).Bool}`,
          // 	`**Deletable** ${checkOrCross(emoji.deletable).Bool}`,
          // 	`**Animated** ${checkOrCross(emoji.animated).Bool}`,
          // 	`**Managed** ${checkOrCross(emoji.managed).Bool}`,
          // ], true);
          .setColor("ORANGE")
          .setDescription("This option is in WIP!");
        interaction.reply({ embeds: [embed2], ephemeral: true });
        break;
      case "user":
        const client = interaction.client;
        const userses = interaction.options.getUser("user");
        const members = interaction.options.getMember("user");

        const user = client.users.cache.get(userses.id);
        USERS.findOne(
          {
            userID: user.id,
          },
          (err, resbio) => {
            cases.find(
              {
                userID: user.id,
              },
              (err, res) => {
                const member = interaction.guild.members.cache.get(user.id);
                const thebot = user.bot ? "Yes" : "No";
                const nickname = member.nickname
                  ? member.nickname
                  : "No nickname";
                let rolee = "No Roles";
                const embed3 = new AntiEmbed(client)
                  .setTitle(
                    `❓ ${user.tag}` + ` (${user.id})`,
                    user.displayAvatarURL({ dynamic: true }),
                  )
                  .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                  .addField("Bot", thebot, true)
                  .addField(
                    "Created at",
                    moment(user.createdAt).format("MM/DD/YYYY HH:mm:ss A"),
                    true,
                  )
                  .addField(
                    "Global Infractions / Cases",
                    res.length || "None",
                    true,
                  )
                  .addField("User presence", stat, true)
                  .setColor(
                    interaction.member?.roles.highest.hexColor || "AQUA",
                  );
                if (member.flags) {
                  // eslint-disable-next-line max-nested-callbacks
                  let flags = member.flags
                    .toArray()
                    .map((x) =>
                      x
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/(\b\w)/gi, (c) => c.toUpperCase()),
                    )
                    .join("\n");
                  if (!flags) flags = "None";
                  embed3.addField("Discord User badges", flags, true);
                }
                const badges = resbio.badge.map((x) => {
                  const st = {
                    Member: "👥",
                    Developer: "👑",
                    Staff: "🛠",
                    Partner: "🤝",
                  };
                  return st[x];
                });
                embed.addField("AntiRaid User Badges", badges.join(" "), true);
                let stre = "";
                if (resbio.bio.length > 20) {
                  stre += "...";
                } else {
                  stre += "";
                }
                if (resbio.bio)
                  embed3.addField(
                    "Bio",
                    `${resbio.bio.slice(0, 20)}${stre}`,
                    true,
                  );
                let resss = "";
                if (custom.length > 20) {
                  resss = "...";
                } else {
                  resss = "";
                }
                embed.addField(
                  "Custom Status",
                  `${custom.slice(0, 20)}${resss}`,
                  true,
                );
                if (member) {
                  if (
                    member.roles.cache
                      .filter((r) => r.id !== interaction.guild.id)
                      .map((r) => r).length > 0
                  ) {
                    rolee = `${member.roles.cache
                      .filter((r) => r.id !== interaction.guild.id)
                      .sort((c, d) => d.position - c.position)
                      .first(20)
                      .map((r) => r)
                      .join(" **›** ")}`;
                  }
                  embed3.addField(
                    "Joined At",
                    moment(member.joinedAt).format("MM/DD/YYYY HH:mm:ss A"),
                    true,
                  );
                  embed3.addField("Nickname In Server", nickname, true);
                  embed3.addField(`Roles (${member.roles.cache.size})`, rolee);
                } else {
                  embed3.addField(
                    "Information",
                    "User is not in server to show server information for him",
                  );
                }

                interaction.reply({ embeds: [embed3], ephemeral: true });
              },
            );
          },
        );
        break;
      case "role":
        if (type === "info") {
          const embed4 = new AntiEmbed(interaction.client)
            .setTitle(`ℹ Info for ${role.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setColor(role.hexColor)
            .addField("Name", role.name, true)
            .addField("ID", role.id, true)
            .addField("Hex Color", role.hexColor, true)
            .addField("Can be Edited", role.editable ? "Yes" : "No", true)
            .addField("Deleted", role.deleted ? "Yes" : "No", true)
            .addField("Hoisted", role.hoist ? "Yes" : "No", true)
            .addField(
              "Can be mentioned",
              role.mentionable ? "Yes" : "No",
              true,
            );
          interaction.reply({ embeds: [embed4], ephemeral: true });
        } else if (type === "perms") {
          const embewd = new AntiEmbed(interaction.client)
            .setColor(role.hexColor)
            .setTitle(`ℹ Permissions Info for Role: ${role.name}`)
            .setDescription(
              `\`\`\`diff\n===== Given Perms =====\n${role.permissions
                .toArray()
                .map((x) => `+ ${interaction.client.utils.formatPerms(x)}`)
                .join("\n")}\n ===== Not Given Perms ===== \n${role.permissions
                .missing(Permissions.ALL)
                .map((x) => `- ${interaction.client.utils.formatPerms(x)}`)
                .join("\n")}\`\`\``,
            );
          interaction.reply({ embeds: [embewd], ephemeral: true });
        }
        break;
      case "server":
        const { guild } = interaction;
        let counts = "No roles";
        if (guild.roles.cache.size > 20) {
          counts = ` and **${interaction.guild.roles.cache.size - 20}** more`;
        } else {
          counts = "";
        }
        const embedw = new AntiEmbed(interaction.client)
          .setTitle(
            `${guild.name} (${guild.id})`,
            guild.iconURL({ dynamic: true }),
          )
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .addField("Server Name:", guild.name, true)
          .addField("Server ID:", guild.id, true)
          .addField(
            "Server Owner:",
            interaction.client.users.cache.get(guild.ownerId).tag ||
              "Couldn't fetch user tag",
            true,
          )
          .addField(
            "Server Count: Members / Bots / Total",
            `👥 ${guild.members.cache.filter((m) => !m.user.bot).size} / 🤖 ${
              guild.members.cache.filter((m) => m.user.bot).size
            } / 👥🤖 ${guild.memberCount}`,
            true,
          )
          .addField(
            "Channels: Voice / Text",
            `# ${
              guild.channels.cache.filter((ch) => ch.type === "text").size
            } / 🔊 ${
              guild.channels.cache.filter((s) => s.type === "voice").size
            }`,
            true,
          )
          .addField("Boosts:", guild.premiumSubscriptionCount, true)
          .addField("Tier:", guild.premiumTier, true)
          .addField("Emojis:", guild.emojis.cache.size, true)
          .addField("Region:", guild.region, true)
          .setColor(interaction.member.roles.highest.hexColor)
          .addField(
            `Roles: (${interaction.guild.roles.cache.size})`,
            `${interaction.guild.roles.cache
              .filter((r) => r.id !== interaction.guild.id)
              .sort((a, b) => b.position - a.position)
              .first(20)
              .map((r) => r)
              .join(" **›** ")}${counts}`,
          );
        interaction.reply({ embeds: [embedw], ephemeral: true });
        break;
      /*	let topic = 'No topic for this channel';
		if (channel.topic) {
			topic = channel.topic;
		}
		let str = '';

		if (topic.length > 20) {
			str += '...';
		}
		const embed2 = new MessageEmbed()
			.setTitle(`🌐 ${channel.name}` + ` (${channel.id})`, client.user.displayAvatarURL())
			.setColor('RANDOM')
			.addField('Name:', channel.name, true)
			.addField('ID:', channel.id, true)
			.addField('Deleted:', channel.deleted ? 'Yes' : 'No', true)
			.addField('Deletable', channel.deletable ? 'Yes' : 'No', true)
			.addField('Type:', client.utils.capitalise(channel.type), true)
			.addField('Position:', message.guild.channels.cache.filter(c => c.type == channel.type).size - channel.position, true)
			.addField('Topic:', `${topic.substr(0, 20)}${str}`, true)
			.setFooter({text: ('Channel created at ' + channel.createdAt.toLocaleString());
		message.channel.send(embed2); */
    }
  },
};
