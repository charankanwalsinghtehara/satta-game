
const SOUND_API = "https://sfxmint.com/api/v1/search";

const SOUND_SEARCHES = {
  buy: [
    "cash register cha ching",
    "cartoon success sound",
    "positive game sound",
  ],
  profit: [
    "cash register cha ching",
    "happy victory sound",
    "cartoon celebration",
  ],
  loss: [
    "sad trombone",
    "cartoon fail sound",
    "game over funny sound",
  ],
  neutral: [
    "cartoon pop sound",
    "funny boing",
    "soft game notification",
  ],
};

const soundCache = new Map();
const lastSoundByCategory = new Map();

let audioPlayer = null;
let soundEnabled = true;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function setTradeSoundsEnabled(enabled) {
  soundEnabled = Boolean(enabled);

  if (!soundEnabled && audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
}

export function areTradeSoundsEnabled() {
  return soundEnabled;
}

async function fetchSounds(query) {
  if (soundCache.has(query)) {
    return soundCache.get(query);
  }

  const response = await fetch(
    `${SOUND_API}?q=${encodeURIComponent(query)}&limit=10`,
  );

  if (!response.ok) {
    throw new Error(`Sound search failed (${response.status}).`);
  }

  const data = await response.json();
  const sounds = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  soundCache.set(query, sounds);
  return sounds;
}

async function findSound(category) {
  const searches = SOUND_SEARCHES[category] || SOUND_SEARCHES.neutral;

  for (const query of searches) {
    try {
      const sounds = await fetchSounds(query);
      const previousSlug = lastSoundByCategory.get(category);

      const playable = sounds.filter((sound) => {
        if (!sound?.mp3_url) return false;

        try {
          const url = new URL(sound.mp3_url);
          return url.protocol === "https:" || url.protocol === "http:";
        } catch {
          return false;
        }
      });

      if (!playable.length) continue;

      const alternatives = playable.filter(
        (sound) => sound.slug !== previousSlug,
      );

      const chosen = randomItem(alternatives.length ? alternatives : playable);

      lastSoundByCategory.set(category, chosen.slug || chosen.mp3_url);
      return chosen;
    } catch (error) {
      // A failed sound provider should never break a successful trade.
      console.warn(`Could not load "${query}" sound:`, error);
    }
  }

  return null;
}

export async function playTradeSound(type = "buy", outcome = "neutral") {
  if (!soundEnabled) return;

  const category =
    outcome === "profit" || outcome === "loss"
      ? outcome
      : type === "buy"
        ? "buy"
        : "neutral";

  try {
    const sound = await findSound(category);

    if (!sound?.mp3_url || !soundEnabled) return;

    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    audioPlayer = new Audio(sound.mp3_url);
    audioPlayer.volume = 0.55;
    audioPlayer.preload = "none";

    await audioPlayer.play();
  } catch (error) {
    // Browser autoplay rules or a third-party sound outage are non-fatal.
    console.warn("Trade sound could not play:", error);
  }
}
