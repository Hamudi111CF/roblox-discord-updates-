const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// CONFIGURATION
const DISCORD_CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

client.login(BOT_TOKEN);
