
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const UNIVERSE_ID = process.env.UNIVERSE_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.BOT_TOKEN;

const STATE_FILE = "last_seen.json";

async function githubRequest(path, options = {}) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/contents/${path}`,
    {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.status === 404 ? null : response.json();
}

async function main() {
  const response = await fetch(
    `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`
  );

  if (!response.ok) throw new Error("Roblox API failed");

  const result = await response.json();
  const game = result.data?.[0];

  if (!game) throw new Error("Game not found");

  const previousFile = await githubRequest(STATE_FILE);
  let previous = null;

  if (previousFile) {
    previous = JSON.parse(
      Buffer.from(previousFile.content, "base64").toString()
    );
  }

  const current = {
    updated: game.updated
  };

  if (!previous) {
    console.log("First run: saving the current game update date.");
  } else if (previous.updated !== current.updated) {
    await client.login(TOKEN);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🆕 GAME UPDATED!")
      .setDescription(`**${game.name}** has been updated!`)
      .addFields({
        name: "Game",
        value: `[Play Now](https://www.roblox.com/games/131365937565115)`
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log("Update announcement sent!");
    await client.destroy();
  } else {
    console.log("No new update detected.");
  }

  const content = Buffer.from(
    JSON.stringify(current, null, 2)
  ).toString("base64");

  await githubRequest(STATE_FILE, {
    method: "PUT",
    body: JSON.stringify({
      message: "Update Roblox game tracking state",
      content,
      ...(previousFile ? { sha: previousFile.sha } : {})
    })
  });

  console.log("Tracking state saved.");
}

main().catch(async error => {
  console.error(error);
  if (client.isReady()) await client.destroy();
  process.exit(1);
});
