
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const UNIVERSE_ID = process.env.UNIVERSE_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.BOT_TOKEN;
const PLACE_ID = process.env.PLACE_ID;

async function main() {
  // Get Roblox game information
  const response = await fetch(
    `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`
  );

  if (!response.ok) {
    throw new Error("Could not fetch Roblox game information.");
  }

  const result = await response.json();
  const game = result.data?.[0];

  if (!game) {
    throw new Error("Game not found.");
  }

  // Get the game's icon
  const thumbnailResponse = await fetch(
    `https://thumbnails.roblox.com/v1/games/icons?universeIds=${UNIVERSE_ID}&size=512x512&format=Png&isCircular=false`
  );

  if (!thumbnailResponse.ok) {
    throw new Error("Could not fetch the Roblox game icon.");
  }

  const thumbnailData = await thumbnailResponse.json();
  const gameIcon = thumbnailData.data?.[0]?.imageUrl;

  if (!gameIcon) {
    throw new Error("Roblox did not return a game icon.");
  }

  // Connect Discord bot
  await client.login(TOKEN);

  const channel = await client.channels.fetch(CHANNEL_ID);

  if (!channel || !channel.isTextBased()) {
    throw new Error("Discord channel not found or is not text-based.");
  }

  // Create announcement embed
  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setAuthor({
      name: "ROBLOX GAME UPDATES",
      iconURL: gameIcon
    })
    .setTitle("🆕 GAME UPDATE!")
    .setDescription(
      `**${game.name}** announcement system test!\n\nThe bot is working correctly.`
    )
    .setThumbnail(gameIcon)
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
    .setFooter({
      text: "Roblox Game Updates"
    })
    .setTimestamp();

  // Send announcement
  await channel.send({
    embeds: [embed]
  });

  console.log("Announcement with game icon sent successfully!");

  await client.destroy();
}

main().catch(async error => {
  console.error(error);

  if (client.isReady()) {
    await client.destroy();
  }

  process.exit(1);
});
