/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { readdirSync } = require("fs");
const { join } = require("path");
const filePath2 = join(__dirname, "..", "events");
const Dashboard = require("../dashboard/dashboard");
const eventFiles2 = readdirSync(filePath2);
const mongoose = require("mongoose");
const { mongo_url } = require("../../config");
const { MessageEmbed } = require("discord.js");

module.exports = async (error) => {
  try {
    const embed = new MessageEmbed()
      .setColor("RED")
      .setAuthor("Error landed", client.user.displayAvatarURL())
      .setDescription(error);
    client.channels.cache.get("833777970916229200").send({ embeds: [embed] });
  } catch (err) {
    console.log(err);
  }
};
