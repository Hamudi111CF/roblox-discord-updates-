const { Client, GatewayIntentBits, EmbedBuilder } =
  require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function main() {
  await client.login(process.env.BOT_TOKEN);

  const channel = await client.channels.fetch(
    process.env.CHANNEL_ID
  );

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🚀 Roblox Updates")
    .setDescription("Our announcement system is online!")
    .setFooter({ text: "Roblox Community" })
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  console.log("Test announcement sent!");
  await client.destroy();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
