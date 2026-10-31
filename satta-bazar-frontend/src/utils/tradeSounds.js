
let audioContext = null;
let enabled = true;
let lastPlayedAt = 0;
let currentAudio = null;

// Remote meme sounds; local synthesized sounds are the fallback.
const MEME_SOUNDS = {
  profit: "https://www.myinstants.com/media/sounds/vine-boom.mp3",
  loss: "https://www.myinstants.com/media/sounds/sad-trombone.mp3",
  buy: "https://www.myinstants.com/media/sounds/pop.mp3",
  sell: "https://www.myinstants.com/media/sounds/bruh.mp3",
};

export function setTradeSoundsEnabled(value) {
  enabled = Boolean(value);
}

export function areTradeSoundsEnabled() {
  return enabled;
}

function getContext() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function tone(ctx, frequency, start, duration, options = {}) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(frequency, start);

  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, options.endFrequency),
      start + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    options.volume || 0.18,
    start + 0.015
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

function playFallback(type, outcome) {
  try {
    const ctx = getContext();
    if (!ctx) return;

    const t = ctx.currentTime + 0.02;

    if (outcome === "profit") {
      // Cha-ching style
      tone(ctx, 1300, t, 0.14, {
        type: "square",
        endFrequency: 900,
        volume: 0.12,
      });

      tone(ctx, 1760, t + 0.1, 0.32, {
        endFrequency: 1100,
        volume: 0.18,
      });
    } else if (outcome === "loss") {
      // Sad trombone style
      [392, 370, 349, 262].forEach((frequency, index) => {
        tone(ctx, frequency, t + index * 0.2, 0.24, {
          type: "triangle",
          endFrequency: frequency * 0.92,
          volume: 0.17,
        });
      });
    } else if (type === "buy") {
      // Happy purchase pop
      tone(ctx, 500, t, 0.12, {
        endFrequency: 180,
        volume: 0.18,
      });

      tone(ctx, 740, t + 0.04, 0.1, {
        type: "triangle",
        endFrequency: 420,
        volume: 0.1,
      });
    } else {
      // Funny low-pitched bruh-style sound
      tone(ctx, 210, t, 0.18, {
        type: "square",
        endFrequency: 155,
        volume: 0.16,
      });

      tone(ctx, 155, t + 0.18, 0.25, {
        type: "triangle",
        endFrequency: 105,
        volume: 0.18,
      });
    }
  } catch (error) {
    console.warn("Fallback sound unavailable:", error);
  }
}

export async function playTradeSound(type = "buy", outcome = "neutral") {
  if (!enabled) return;

  // Avoid duplicate sounds from repeated UI events.
  const now = Date.now();

  if (now - lastPlayedAt < 600) return;

  lastPlayedAt = now;

  const soundKey =
    outcome === "profit"
      ? "profit"
      : outcome === "loss"
        ? "loss"
        : type === "buy"
          ? "buy"
          : "sell";

  const soundUrl = MEME_SOUNDS[soundKey];

  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(soundUrl);
    currentAudio = audio;
    audio.volume = 0.65;
    audio.preload = "auto";

    audio.onerror = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        playFallback(type, outcome);
      }
    };

    await audio.play();
  } catch (error) {
    // Remote audio can fail due to network, browser policy, or URL changes.
    currentAudio = null;
    playFallback(type, outcome);
  }
}
