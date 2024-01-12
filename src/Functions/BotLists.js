const fetch = require("node-fetch");

module.exports = class BotLists {
  constructor(client) {
    this.client = client;
  }
  ibl(servers, shards) {
    fetch("https://api.infinitybotlist.com/bot/793970956610699315", {
      method: "POST",
      headers: {
        authorization: this.client.config.iblAPI,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ servers: servers, shards: shards }),
    }).then(async (res) => console.log(await res.json()));
  }
  fates(servers, shards, users) {
    fetch("https://fateslist.xyz/api/v2/bots/793970956610699315/stats", {
      method: "POST",
      headers: {
        authorization: this.client.config.fates,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guild_count: servers,
        shard_count: shards,
        shards: [0],
        user_count: users,
      }),
    }).then(async (res) => console.log(await res.json()));
  }
};
