
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
const ROLE_ID = process.env.UPDATE_ROLE_ID;
const UNIVERSE_ID = process.env.UNIVERSE_ID;
const PLACE_ID = process.env.PLACE_ID;

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

async function sendAnnouncement(title, message) {
  await client.login(TOKEN);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased() || !channel.send) {
      throw new Error("Discord announcement channel not found.");
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(title)
      .setDescription(message)
      .addFields({
        name: "🎮 Play the game",
        value: `[Click here to play](https://www.roblox.com/games/${PLACE_ID})`
      })
      .setFooter({
        text: "Brainrot Corp Tycoon • Announcements"
      })
      .setTimestamp();

    await channel.send({
      content: `<@&${ROLE_ID}>`,
      embeds: [embed],
      allowedMentions: {
        roles: [ROLE_ID]
      }
    });

    console.log("Announcement sent successfully!");
  } finally {
    await client.destroy();
  }
}

async function automaticUpdateCheck() {
  const response = await fetch(
    `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`
  );

  if (!response.ok) {
    throw new Error("Roblox API request failed.");
  }

  const result = await response.json();
  const game = result.data?.[0];

  if (!game) {
    throw new Error("Roblox game not found.");
  }

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
    console.log("First run: saving the current update date.");
  } else if (previous.updated !== current.updated) {
    await sendAnnouncement(
      "🆕 GAME UPDATED!",
      `**${game.name}** has received a new update!\n\nJump into the game and check it out!`
    );
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

async function main() {
  if (!TOKEN || !CHANNEL_ID || !ROLE_ID) {
    throw new Error("Missing Discord environment variables.");
  }

  if (process.env.EVENT_NAME === "workflow_dispatch") {
    const title = process.env.ANNOUNCEMENT_TITLE;
    const message = process.env.ANNOUNCEMENT_MESSAGE;

    if (!title || !message) {
      throw new Error("Announcement title or message is missing.");
    }

    await sendAnnouncement(title, message);
  } else {
    if (!UNIVERSE_ID || !PLACE_ID) {
      throw new Error("Missing Roblox game IDs.");
    }

    await automaticUpdateCheck();
  }
}

main().catch(async error => {
  console.error(error);

  if (client.isReady()) {
    await client.destroy();
  }

  process.exit(1);
});
