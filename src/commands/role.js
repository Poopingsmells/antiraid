/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require("@discordjs/builders");
const AntiEmbed = require("../Functions/AntiEmbed");
const {
  MessageActionRow,
  MessageButton,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  category: "utility",
  guildOnly: true,
  cooldownLevel: 4,
  requirements: {
    user: ["MANAGE_ROLES"],
    userLevel: 3,
    client: ["MANAGE_ROLES"],
  },
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Mass manage roles")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription(
          "Add a role to a user, to all, or to all users with another role",
        )
        .addRoleOption((role) =>
          role
            .setName("role")
            .setDescription("The role to give")
            .setRequired(true),
        )
        .addMentionableOption((option) =>
          option
            .setName("target")
            .setDescription(
              "The user or role to give the role to. Leave blank to give to all members",
            ),
        )
        .addBooleanOption((opt) =>
          opt
            .setName("bots")
            .setDescription(
              "Should i add the role to bots too? Default is false",
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription(
          "Remove a role from a user, from all, or from all users with another role",
        )
        .addRoleOption((role) =>
          role
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true),
        )
        .addMentionableOption((option) =>
          option
            .setName("target")
            .setDescription(
              "The user or role to remove the role from. Leave blank to remove from all members",
            ),
        )
        .addBooleanOption((opt) =>
          opt
            .setName("bots")
            .setDescription(
              "Should i remove the role from bots too? Default is false",
            ),
        ),
    ),
  // .addSubcommand(create => create
  // 	.setName('create')
  // 	.setDescription('Create a new role')
  // 	.addStringOption(name => name
  // 		.setName('name')
  // 		.setDescription('The name for the role')
  // 		.setRequired(true))
  // 	.addStringOption(str => str
  // 		.setName('color')
  // 		.setDescription('The color for the role. Must be all UPPERCASE ( i.e RED )').setRequired(true))
  // 	.addBooleanOption(hoist => hoist
  // 		.setName('hoist')
  // 		.setDescription('Whether the role should appear in the member list'))

  // 	.addBooleanOption(mention => mention
  // 		.setName('mention')
  // 		.setDescription('Whether the role can be mentionned by everyone')))
  /**
   * @param {CommandInteraction} interaction
   * @returns
   */
  run: async (interaction) => {
    if (interaction.options.getSubcommand() === "create")
      return createRole(interaction);
    const give = interaction.options.getSubcommand() === "add" ? true : false;
    const role = interaction.options.getRole("role");
    let target = interaction.options.getMentionable("target");
    const bots = interaction.options.getBoolean("bots");
    if (!target) target = "all members";
    let msg = `Please confirm that you want to ${
      give ? "give" : "remove"
    } the ${role} role ${give ? "to" : "from"} `;
    if (target.user) {
      msg += target.user.tag;
    } else if (target == "all members" && bots === true) {
      msg += target;
    } else {
      msg += `all members with the ${target} role`;
    }
    // ro-${give ? 'g' : 'r'}-${target.user ? 'u' : 'r'}-${role.id}-${target.id}
    const code = interaction.createdTimestamp;
    interaction.reply({
      embeds: [new AntiEmbed().setTitle("Confirmation").setDescription(msg)],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Confirm")
            .setStyle(3)
            .setCustomId(`confirm-${code}`),
        ),
      ],
    });
    const filter = (button) =>
      button.customId == `confirm-${code}` &&
      button.user.id == interaction.user.id;
    interaction.channel
      .awaitMessageComponent({ filter, time: 15000, type: "BUTTON" })
      .then(async (confirmed) => {
        if (!confirmed) return;
        interaction.editReply({
          embeds: [
            new AntiEmbed().setTitle("Confirmation").setDescription(msg),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel("Confirmed")
                .setStyle(3)
                .setCustomId(`confirm-${code}`)
                .setDisabled(true),
            ),
          ],
        });

        const targets = [];
        if (target.user) {
          await target.fetch();
          targets.push(target);
        } else if (target == "all members" && bots === true) {
          interaction.guild.members.cache.map((members) => {
            targets.push(members);
          });
        } else if (target == "all members" && bots === false) {
          interaction.guild.members.cache
            .filter((user) => user.bot === false)
            .map((members) => {
              targets.push(members);
            });
        } else {
          role.members.cache.map(async (member) => {
            targets.push(member);
          });
        }
        targets.filter((m) => !m.roles.cache.has(role.id));

        let successful = 0;
        for (const member of targets) {
          if (give) {
            successful++;
            member.roles.add(role).catch(() => successful--);
          } else {
            successful++;
            member.roles.remove(role).catch(() => successful--);
          }
        }
        confirmed.reply({
          embeds: [
            new AntiEmbed()
              .setTitle("Task finished")
              .setDescription(
                `${give ? "Gave" : "Removed"} the ${role} role ${
                  give ? "to" : "from"
                } ${successful} members`,
              )
              .addField("Successful", String(successful), true)
              .addField(
                "Unsuccessful",
                String(targets.length - successful),
                true,
              ),
          ],
        });
      })
      .catch((err) => {
        console.error(err);
        interaction.followUp({ content: "This request timed out" });
        interaction.editReply({
          embeds: [
            new AntiEmbed().setTitle("Confirmation").setDescription(msg),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel("Error")
                .setStyle("DANGER")
                .setCustomId(`confirm-${code}`)
                .setDisabled(true),
            ),
          ],
        });
      });
  },
};

// eslint-disable-next-line no-unused-vars
function createRole(interaction) {
  // to be finished
}
