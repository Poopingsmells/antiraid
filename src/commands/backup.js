const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const AntiEmbed = require("../Functions/AntiEmbed");
// const backup = require('discord-backup');
// const findBackups = require('../models/backupData');
// const generator = require('generate-password');

module.exports = {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("backup")
    .setDescription("Creates, loads, gives you info about a backup")
    .addSubcommand((load) =>
      load
        .setName("create")
        .setDescription(
          "Creates a backup and saves basically everything that is possible to be backupped!",
        ),
    )
    .addSubcommand((info) =>
      info
        .setName("info")
        .setDescription("Gives you info about the backup")
        .addStringOption((id) =>
          id
            .setName("backupid")
            .setDescription("The id for the backup you want to see info")
            .setRequired(true),
        ),
    )
    .addSubcommand((load) =>
      load
        .setName("load")
        .setDescription("Loads a backup")
        .addStringOption((loadid) =>
          loadid
            .setName("loadid")
            .setDescription("I need a backup id to load")
            .setRequired(true),
        ),
    )
    .addSubcommand((del) =>
      del
        .setName("delete")
        .setDescription("Deletes a backup")
        .addStringOption((id) =>
          id
            .setName("deleteid")
            .setDescription("The id for the backup you want me to delete")
            .setRequired(true),
        ),
    ),
  requirements: {
    user: ["MANAGE_GUILD"],
    userLevel: 3,
  },
  ownerOnly: false,
  /**
   * @param {CommandInteraction} interaction
   */
  run: (interaction) => {
    const choice = interaction.options.getSubcommand();
    switch (choice) {
      // case 'create':
      //     try {
      //         const id = generator.generate({ length: 16, uppercase: false, numbers: true, excludeSimilarCharacters: true });
      //         backup.create(interaction.guild, { backupID: id, jsonSave: false }).then(backupData => {
      //             const embed = new AntiEmbed(interaction.client)
      //                 .success('Backup Successfully created!')
      //                 .addField('ID', backupData.id, true)
      //                 .addField('Name', backupData.name, true)
      //             interaction.reply({ embeds: [embed] })
      //             const data = new findBackups({
      //                 BackupData: backupData,
      //                 BackupId: backupData.id,
      //                 BackupGuildId: interaction.guild.id
      //             });
      //             data.save();
      //             const embed2 = new AntiEmbed(interaction.client)
      //                 .warn(`Backup is created! Make sure to keep this key: \`${backupData.id}\` for when you are loading that backup!`)
      //                 .addField('Created in Server', interaction.guild.name, true)
      //             try {
      //                 interaction.client.users.cache.get(interaction.guild.ownerId).send({ embeds: [embed2] })
      //             } catch (err) {
      //                 interaction.channel.send({ embeds: [embed2] })
      //                 return interaction.reply({ embeds: [new AntiEmbed(interaction.client).error(':x: An error occurred while sending a message to the owner and im sending it here')] });
      //             }
      //         }).catch(() => {
      //             return interaction.reply({ embeds: [new AntiEmbed(interaction.client).error(':x: An error occurred, please check if the bot is administrator!')] });
      //         });
      //     } catch (err) {
      //         console.log(err);
      //     }
      //     break;
      // case 'info':
      //     const bid = interaction.options.getString('backupid');
      //     backup.fetch(bid).then((backupInfos) => {
      //         const date = new Date(backupInfos.data.createdTimestamp);
      //         const yyyy = date.getFullYear().toString(), mm = (date.getMonth() + 1).toString(), dd = date.getDate().toString();
      //         const formatedDate = `${yyyy}/${(mm[1] ? mm : "0" + mm[0])}/${(dd[1] ? dd : "0" + dd[0])}`;
      //         const embed = new AntiEmbed(interaction.client)
      //             .normal(`Info for \`${interaction.guild.name}\`'s Backup with ID: \`${backupInfos.id}\``)
      //             .addField('ID', backupInfos.id, true)
      //             .addField('Size', backupInfos.size + ' KB', true)
      //             // .addField('Data', info.data)
      //             .addField('Created At', formatedDate, true)
      //         interaction.reply({ embeds: [embed] });
      //     }).catch((err) => {
      //         return interaction.reply({ embeds: [new AntiEmbed(interaction.client).error('An error occurred! ' + err)] });

      //     })
      //     break;
      // case 'load':
      //     const loadidd = interaction.options.getString('loadid');
      //     const embed3 = new AntiEmbed(interaction.client)
      //         .warn(`Loading Backup: \`${loadidd}\`\nType \`-confirm\` to confirm you want all the roles, channels etc. be replaced... You have 20 seconds`)
      //     backup.fetch(loadidd).then(async () => {
      //         interaction.reply({ embeds: [embed3] })
      //         await interaction.channel.awaitMessages(m => (m.user.id === interaction.user.id) && (m.content === "-confirm"), {
      //             max: 1,
      //             time: 20000,
      //             errors: ["time"]
      //         }).catch((err) => {
      //             return interaction.channel.send(":x: | Time's up! Cancelled backup loading!");
      //         });
      //         interaction.user.send({ embeds: [new AntiEmbed(interaction.client).warn("Starting the loading process of the backup!")] });
      //         backup.load(loadid, interaction.guild).then(() => {
      //             backup.remove(load);
      //         }).catch((err) => {
      //             return intereaction.user.send({ embeds: [new AntiEmbed(interaction.client).error("Sorry, an error occurred... Please check that I have administrator permissions!")] })
      //         });
      //     }).catch((err) => {
      //         return interaction.reply({ embeds: [new AntiEmbed(interaction.client).error("No backup found for `" + loadidd + "`!")] });
      //     });
      //     break;
      default:
        interaction.reply({
          embeds: [
            new AntiEmbed(interaction.client).error(
              "Backup feature is in Development! More info at Support Server",
            ),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setURL("https://antiraid.xyz/discord")
                .setLabel("Support Server")
                .setStyle("LINK"),
            ),
          ],
        });
    }
  },
};
