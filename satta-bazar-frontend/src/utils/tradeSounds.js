let audioContext = null;
let soundsEnabled = true;
let lastPlayedAt = 0;

export function setTradeSoundsEnabled(value) {
  soundsEnabled = Boolean(value);
}

export function areTradeSoundsEnabled() {
  return soundsEnabled;
}

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

// Call this directly from the Buy/Sell click, before making the API request.
export function unlockTradeAudio() {
  const context = getAudioContext();

  if (!context) return Promise.resolve(false);

  if (context.state === "suspended") {
    return context.resume()
      .then(() => true)
      .catch(() => false);
  }

  return Promise.resolve(true);
}

function playTone(context, {
  frequency,
  endFrequency,
  start,
  duration,
  volume = 0.12,
  type = "sine",
}) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency),
      start + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.015
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function playSequence(context, notes) {
  const start = context.currentTime + 0.025;

  notes.forEach((note) => {
    playTone(context, {
      ...note,
      start: start + note.offset,
    });
  });
}

const SOUND_PATTERNS = {
  buy: [
    {
      frequency: 520,
      endFrequency: 760,
      offset: 0,
      duration: 0.12,
      type: "triangle",
      volume: 0.13,
    },
    {
      frequency: 880,
      endFrequency: 1100,
      offset: 0.09,
      duration: 0.18,
      type: "sine",
      volume: 0.11,
    },
  ],

  sell: [
    {
      frequency: 380,
      endFrequency: 250,
      offset: 0,
      duration: 0.16,
      type: "square",
      volume: 0.08,
    },
    {
      frequency: 250,
      endFrequency: 170,
      offset: 0.14,
      duration: 0.2,
      type: "triangle",
      volume: 0.1,
    },
  ],

  profit: [
    {
      frequency: 880,
      endFrequency: 1050,
      offset: 0,
      duration: 0.12,
      type: "square",
      volume: 0.09,
    },
    {
      frequency: 1175,
      endFrequency: 1390,
      offset: 0.1,
      duration: 0.16,
      type: "triangle",
      volume: 0.12,
    },
    {
      frequency: 1568,
      endFrequency: 1760,
      offset: 0.23,
      duration: 0.24,
      type: "sine",
      volume: 0.13,
    },
  ],

  loss: [
    {
      frequency: 392,
      endFrequency: 350,
      offset: 0,
      duration: 0.2,
      type: "triangle",
      volume: 0.12,
    },
    {
      frequency: 330,
      endFrequency: 290,
      offset: 0.18,
      duration: 0.22,
      type: "triangle",
      volume: 0.12,
    },
    {
      frequency: 262,
      endFrequency: 190,
      offset: 0.38,
      duration: 0.32,
      type: "triangle",
      volume: 0.13,
    },
  ],
};

export async function playTradeSound(
  type = "buy",
  outcome = "neutral"
) {
  if (!soundsEnabled) return;

  const now = Date.now();

  if (now - lastPlayedAt < 450) return;

  lastPlayedAt = now;

  const soundKey =
    outcome === "profit"
      ? "profit"
      : outcome === "loss"
        ? "loss"
        : type === "sell"
          ? "sell"
          : "buy";

  const context = getAudioContext();

  if (!context) return;

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    if (context.state !== "running") return;

    playSequence(
      context,
      SOUND_PATTERNS[soundKey] || SOUND_PATTERNS.buy
    );
  } catch (error) {
    console.warn("Trade sound could not play:", error);
  }
}
