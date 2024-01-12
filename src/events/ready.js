const Discord = require("discord.js");
const { stripIndents } = require("common-tags");
// eslint-disable-next-line no-unused-vars
const Dashboard = require("../dashboard/dashboard");
const mongoose = require("mongoose");
const { mongo_url } = require("../../config");
const web = require("../app/index");

module.exports = {
  name: "ready",
  once: true,
  run: (client) => {
    mongoose.connect(
      mongo_url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true,
      },
      (err) => {
        if (err) return console.error(err);
        client.logger.log("ready", "Connected to MongoDB");
      },
    );
    let realdomain = "Unknown";
    let version;
    if (client.user.id === client.config.id) {
      realdomain = client.config.simpledomain;
      version = client.config.version;
    } else {
      realdomain = client.config.betadomain;
      version = client.config.betaversion;
    }
    let realversion = "Unknown";
    if (client.user.id === client.config.id) {
      realversion = "Production / main client";
    } else {
      realversion = "Development / beta client";
    }
    // NOTE: <Client>.setStatus no longer returns a Promise in d.js v13
    // eslint-disable-next-line no-inline-comments
    client.user.setPresence({
      activities: [{ name: realdomain }],
      status: "idle",
    });
    const embed = new Discord.MessageEmbed()
      .setColor("BLUE")
      .setTitle("✅ | " + client.user.username + " is online")
      .setDescription(stripIndents`
    - **Status** = _⛔ DND_
    - **Domain** = _${realdomain}_
    - **Version** = _${version}_
    - **Client** = _${realversion}_
    - **API Latency** = _${client.ws.ping}ms_`);
    const webhook = new Discord.WebhookClient({
      url: "https://discord.com/api/webhooks/940672806813843578/BxEhmYUTcV0qTOzl9uevWbFIGNWgX05LvyzCaRFF-Hl6zEkdzZwb3CrKqagF6-yeag8Y",
    });
    webhook.send({
      embeds: [embed],
      username: client.user.username,
      avatarURL: client.user.displayAvatarURL(),
    });
    console.log("Discord Client - " + client.user.username + " - Ready");
    // Dashboard(client);
    new web(client, client.config);
  },
};
