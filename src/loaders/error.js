const Discord = require("discord.js");

module.exports.run = (client) => {
  process.on("unhandledRejection", (reason, p) => {
    const errEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("⚠ New Error")
      .setDescription(
        "An error just occured in the bot console!**\n\nERROR:\n\n** ```" +
          reason +
          "\n\n" +
          p +
          "```",
      )
      .setTimestamp();

    const webhook = new Discord.WebhookClient({
      url: "https://canary.discord.com/api/webhooks/947774729077530654/scdADwgI8K9rd1w1fKY1ZqwQ2kdfmGBvvRuyH-qZpXu87i4laQtoJJceJAU9LAG5J0NK",
    });
    webhook.send({
      embeds: [errEmbed],
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
    });
  });

  process.on("uncaughtException", (err, origin) => {
    const errEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("⚠ New Error")
      .setDescription(
        "An error just occured in the bot console!**\n\nERROR:\n\n** ```" +
          err.stack +
          "\n\n" +
          origin +
          "```",
      )
      .setTimestamp();

    const webhook = new Discord.WebhookClient({
      url: "https://canary.discord.com/api/webhooks/947774729077530654/scdADwgI8K9rd1w1fKY1ZqwQ2kdfmGBvvRuyH-qZpXu87i4laQtoJJceJAU9LAG5J0NK",
    });
    webhook.send({
      embeds: [errEmbed],
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
    });
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    const errEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("⚠ New Error")
      .setDescription(
        "An error just occured in the bot console!**\n\nERROR:\n\n** ```" +
          err.stack +
          "\n\n" +
          origin +
          "```",
      )
      .setTimestamp();

    const webhook = new Discord.WebhookClient({
      url: "https://canary.discord.com/api/webhooks/947774729077530654/scdADwgI8K9rd1w1fKY1ZqwQ2kdfmGBvvRuyH-qZpXu87i4laQtoJJceJAU9LAG5J0NK",
    });
    webhook.send({
      embeds: [errEmbed],
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
    });
  });

  process.on("multipleResolves", (type, promise, reason) => {
    const errEmbed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("⚠ New Error")
      .setDescription(
        "An error just occured in the bot console!**\n\nERROR:\n\n** ```" +
          type +
          "\n\n" +
          promise +
          "\n\n" +
          reason +
          "```",
      )
      .setTimestamp();

    const webhook = new Discord.WebhookClient({
      url: "https://canary.discord.com/api/webhooks/947774729077530654/scdADwgI8K9rd1w1fKY1ZqwQ2kdfmGBvvRuyH-qZpXu87i4laQtoJJceJAU9LAG5J0NK",
    });
    webhook.send({
      embeds: [errEmbed],
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
    });
  });
};
