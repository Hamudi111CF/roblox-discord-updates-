
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

async function main() {
  const title = process.env.ANNOUNCEMENT_TITLE;
  const message = process.env.ANNOUNCEMENT_MESSAGE;
  const eventName = process.env.EVENT_NAME;

  if (eventName !== "workflow_dispatch" || !title || !message) {
    console.log("Scheduled run: no manual announcement requested.");
    return;
  }

  await client.login(TOKEN);

  const channel = await client.channels.fetch(CHANNEL_ID);

  if (!channel || !channel.isTextBased()) {
    throw new Error("Discord channel not found.");
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(title)
    .setDescription(message)
    .setFooter({
      text: "Brainrot Corp Tycoon • Official Announcements"
    })
    .setTimestamp();

  await channel.send({
    embeds: [embed]
  });

  console.log("Manual announcement sent successfully!");

  await client.destroy();
}

main().catch(async error => {
  console.error(error);

  if (client.isReady()) {
    await client.destroy();
  }

  process.exit(1);
});
