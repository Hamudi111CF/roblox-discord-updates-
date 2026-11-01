
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const UNIVERSE_ID = process.env.UNIVERSE_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.BOT_TOKEN;
const PLACE_ID = process.env.PLACE_ID;

async function main() {
  const response = await fetch(
    `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`
  );

  if (!response.ok) throw new Error("Roblox API failed");

  const result = await response.json();
  const game = result.data?.[0];

  if (!game) throw new Error("Game not found");

  const thumbnailResponse = await fetch(
    `https://thumbnails.roblox.com/v1/games/icons?universeIds=${UNIVERSE_ID}&size=512x512&format=Png&isCircular=false`
  );

  let thumbnail = null;

  if (thumbnailResponse.ok) {
    const thumbnailData = await thumbnailResponse.json();
    thumbnail = thumbnailData.data?.[0]?.imageUrl || null;
  }

  await client.login(TOKEN);

  const channel = await client.channels.fetch(CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🆕 GAME UPDATE TEST!")
    .setDescription(
      `**${game.name}** announcement system test!\n\nThe bot is working correctly.`
    )
    .addFields(
      {
        name: "🎮 Game",
        value: `[Play Now](https://www.roblox.com/games/${PLACE_ID})`,
        inline: true
      },
      {
        name: "🕒 Last Updated",
        value: `<t:${Math.floor(new Date(game.updated).getTime() / 1000)}:R>`,
        inline: true
      }
    )
    .setFooter({ text: "Roblox Game Updates • Test Message" })
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);

  await channel.send({ embeds: [embed] });

  console.log("Test announcement sent successfully!");

  await client.destroy();
}

main().catch(async error => {
  console.error(error);
  if (client.isReady()) await client.destroy();
  process.exit(1);
});
