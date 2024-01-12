const { ShardingManager } = require("discord.js");
const config = require("../config");
const Sentry = require("@sentry/node");

// Sentry
Sentry.init({
  dsn: "https://fa0cba21d21ed33319266f1f2373b75e@trace.select-list.xyz/10",
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});

const manager = new ShardingManager("./src/bot.js", { token: config.token });

manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
