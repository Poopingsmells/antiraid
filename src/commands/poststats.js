const AntiEmbed = require("../Functions/AntiEmbed");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botlists")
    .setDescription("Posts bot stats to botlists"),
  category: "botlists",
  run: async (interaction) => {
    const servers = interaction.client.guilds.cache.size;
    const users = interaction.client.users.cache.size;

    const IBL = await fetch("https://spider.infinitybots.gg/bots/stats", {
      method: "POST",
      body: JSON.stringify({
        servers,
        users,
      }),
      headers: {
        Authorization:
          "iqMQydWCMxIEHYdupmJbFnsAtsLoNWsGDvethwZFlhOnywxmbQrIiQglVGjqbQXnmfsKhRUoWHOCQDPIMJibfUMiDXsTgMWuSXFJftiMKexYaSZmwWVKbDpzLhbVwgfO",
      },
    }).then((res) => {
      if (res.ok) return { status: res.status };
      else return { error: true, status: res.status };
    });

    interaction.reply({
      content: `Posted bot statistics to:\n\t- Infinity Bot List (${IBL.status})`,
    });
  },
};
