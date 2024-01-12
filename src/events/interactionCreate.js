// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require("discord.js");
const { checkLevel } = require("../Functions/UserLevels");
const protocls = require("../models/protocols");
const commandsUsed = require("../models/bot_stats");
const servers = require("../models/servers.js");
const generator = require("generate-password");
module.exports = {
  name: "interactionCreate",
  run: (interaction) => {
    if (interaction.isCommand()) handleCommand(interaction);

    if (interaction.isButton())
      interaction.client.emit("buttonClick", interaction);
  },
};

/**
 * @param {CommandInteraction} interaction
 */
async function handleCommand(interaction) {
  if (!interaction.client.commands.has(interaction.commandName))
    return interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });

  const command = interaction.client.commands.get(interaction.commandName);

  if (interaction.guildOnly && !interaction.inGuild())
    return interaction.reply({
      content: "This command cannot be used outside a server.",
    });
  const member = await interaction.member.fetch();
  const main_guild = interaction.client.guilds.cache.get(
    interaction.client.config.main_guild.id,
  );
  /* if (command.ownerOnly) {
		const devList = main_guild.members.cache.get(interaction.user.id).roles.cache.get(interaction.client.config.main_guild.roles.dev);

		if (!devList) {
			return interaction.reply({ content: 'This command is restricted to AntiRaid\'s developers' });
		}
	} */

  if (command.requirements) {
    if (!interaction.inGuild())
      return interaction.reply({
        content: "This command cannot be used outside a server.",
      });
    if (command.requirements.user) {
      if (typeof command.requirements.user !== "object")
        return interaction.reply({
          content:
            "I have automatically detected an error in the code. If this error is repetetive, you can report it in our [support server](https://discord.gg/uPVRfQVwW5)",
        });
      if (!member.permissions.has(command.requirements.user)) {
        if (!command.requirements.userLevel)
          return interaction.reply({
            content:
              "You do not have the neccesary permission to use this command... Perms needed: " +
              command.requirements.user.map((x) => x).join(", "),
          });
        const check = await checkLevel(member);
        if (!check || check < command.requirements.userLevel)
          return interaction.reply({
            content:
              "You do not have the neccesary permission to use this command",
          });
      }
    } else if (command.requirements.userLevel) {
      const check = await checkLevel(member);
      if (!check || check < command.requirements.userLevel)
        return interaction.reply({
          content:
            "You do not have the neccesary permission to use this command",
        });
    }
  }
  commandsUsed.findOne({}, async (err1, data1) => {
    protocls.findOne({}, async (err, data) => {
      try {
        //const f = main_guild.members.cache.get(interaction.user.id).roles.cache.get(interaction.client.config.main_guild.roles.dev);
        const devList = interaction.client.config.dev.includes(
          interaction.user.id,
        );
        if (data.protocol_1 == true && !devList)
          return interaction.reply({
            content:
              "I am in maintenance mode! No one can use me except the developers",
          });
        if (command.ownerOnly && devList === false)
          return interaction.reply({
            content: "This command is marked for only staff",
          });
        command.run(interaction);
        // eslint-disable-next-line no-unused-vars
        if (data1) {
          data1.commands_used_total = data1.commands_used_total + 1;
          data1.save();
        }
        if (err) {
          console.log(err);
        }
        if (err1) {
          console.log(err1);
        }
      } catch (error) {
        console.error(error);
        return interaction.reply({
          content: `There was an error while executing this command! ${error}`,
          ephemeral: true,
        });
      }
    });
  });
}
