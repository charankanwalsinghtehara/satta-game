
import { useState } from "react";
import "./NuksaanNawab.css";

const categories = [
  {
    keys: ["hello", "hi", "hey", "namaste", "kaise ho"],
    replies: [
      "Oye investor! 😂 Aaj market se paisa banana hai ya market ko entertainment dena hai?",
      "Nawabi salaam, mere sher! 🐂 Portfolio sambhal ke, ego side mein rakh ke.",
    ],
  },
  {
    keys: ["buy", "kharid", "purchase", "entry"],
    replies: [
      "Buy button dabane se pehle research bhi kar le, bhai. Mouse click koi investment strategy nahi! 💀",
      "Entry toh le lega, exit ka plan hai ya seedha documentary banegi? 😂",
      "FOMO mein mat ghus. Fundamentals, risk aur apna budget check kar pehle.",
    ],
  },
  {
    keys: ["sell", "bech", "exit"],
    replies: [
      "Sell karne se pehle apna plan check kar. Har red candle emergency nahi hoti, Nawab! 📉",
      "Profit book karna art hai. Loss mein panic karna free entertainment hai — par mehenga padta hai. 😂",
    ],
  },
  {
    keys: ["loss", "nuksaan", "nuksan", "crash", "red", "gir raha"],
    replies: [
      "Portfolio laal hai? Bhai, Holi October mein kyun khel raha hai? 💀 Risk check kar, revenge trading mat kar.",
      "Market ne aaj tera confidence short kar diya. 😂 Thoda break le aur apna trading plan review kar.",
      "Phone mat tod, sher! Pehle dekh position kitni badi hai aur kitna risk liya tha.",
    ],
  },
  {
    keys: ["profit", "green", "kamaya", "rich", "crorepati"],
    replies: [
      "Oho! Profit aaya aur tu seedha private jet ke sapne dekhne laga. 😂 Pehle risk management ko bhi reward de.",
      "Green portfolio, royal attitude! 👑 Bas ek achhe din ko lifetime guarantee mat samajh.",
      "Profit mubarak, Nawab! Ab overconfidence mein saara wapas mat kar dena.",
    ],
  },
  {
    keys: ["portfolio", "holding", "holdings", "investment"],
    replies: [
      "Portfolio ka health check kar: diversification, position size aur risk. Sirf favourite stocks ka fan club mat bana! 😂",
      "Bhai, saare paise ek stock mein daale hain? Portfolio hai ya ek hi episode ka thriller? 💀",
    ],
  },
  {
    keys: ["tip", "sure shot", "guarantee", "target"],
    replies: [
      "Guaranteed profit? Haan bhai, guaranteed hai ki future koi guarantee nahi kar sakta. 😂",
      "Main Nuksaan Nawab hoon, Baba Predictanand nahi. Research kar aur risk samajh!",
    ],
  },
  {
    keys: ["market", "stock", "share", "nifty", "sensex", "bull", "bear"],
    replies: [
      "Market roller coaster hai, bhai. Seat belt ka naam risk management hai. 🎢",
      "Bull bhi aayega, bear bhi. Tu bas bina plan ke bandar mat ban! 🐒",
      "Chart dekh, fundamentals samajh, aur WhatsApp University se thoda break le.",
    ],
  },
  {
    keys: ["roast", "joke", "funny", "meme", "bakchodi"],
    replies: [
      "Teri strategy itni secret hai ki tujhe khud nahi pata tu kya kar raha hai. 💀",
      "Confidence: 100%. Research: 'Bhai ne bola tha.' 😂📉",
      "Tu buy button aise dabata hai jaise sale aaj hi khatam hone wali ho!",
    ],
  },
  {
    keys: ["help", "advice", "kya karu", "what should", "suggest"],
    replies: [
      "Pehle goal, time horizon aur risk limit bata. Guesswork se bach, mere Nawab!",
      "Main meme-level advice aur basic checklists de sakta hoon. Guaranteed returns nahi, bhai!",
    ],
  },
];

const fallback = [
  "Bhai, meri bakchodi predefined hai! 😂 Try kar: buy, sell, loss, profit, market ya roast.",
  "Samajh nahi aaya, Nawab sahab. Stock market ke baare mein pooch ya 'roast me' bol. 🤡",
  "Mera crystal ball abhi service mein hai. 🔮 Lekin market jokes ready hain!",
];

const suggestions = [
  "Roast me 🤡",
  "Market crash 📉",
  "Buy advice 😂",
  "Profit celebration 🤑",
];

function getReply(message) {
  const text = message.toLowerCase().trim();

  // Roast requests take priority over general stock keywords.
  if (
    text.includes("roast") ||
    text.includes("insult me") ||
    text.includes("meri beizzati")
  ) {
    return categories.find((item) =>
      item.keys.includes("roast")
    ).replies[
      Math.floor(
        Math.random() *
          categories.find((item) => item.keys.includes("roast"))
            .replies.length,
      )
    ];
  }

  const match = categories.find((category) =>
    category.keys.some((key) => text.includes(key)),
  );

  if (!match) {
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return match.replies[
    Math.floor(Math.random() * match.replies.length)
  ];
}

export default function NuksaanNawab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Adaab, mere Nawab! 👑 Main hoon Nuksaan Nawab 🤡 Buy, sell, market crash ya portfolio roast — hukam karo!",
    },
  ]);

  function sendMessage(value = input) {
    const text = value.trim();
    if (!text) return;

    const now = Date.now();

    setMessages((current) => [
      ...current,
      { id: now, from: "user", text },
      {
        id: now + 1,
        from: "bot",
        text: getReply(text),
      },
    ]);

    setInput("");
  }

  function resetChat() {
    setMessages([
      {
        id: Date.now(),
        from: "bot",
        text: "Nayi mehfil, naya nuksaan... mazaak kar raha hoon bhai! 😂 Bol, kya scene hai?",
      },
    ]);
  }

  return (
    <div className="nawab-chat">
      {open && (
        <section
          className="nawab-window"
          aria-label="Nuksaan Nawab chatbot"
        >
          <header className="nawab-header">
            <div className="nawab-avatar">🤡</div>

            <div className="nawab-heading">
              <strong>Nuksaan Nawab</strong>
              <span>Royal bakchodi department 👑</span>
            </div>

            <button
              type="button"
              onClick={resetChat}
              aria-label="New conversation"
              title="New chat"
            >
              ↻
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </header>

          <div className="nawab-disclaimer">
            Virtual stock game · Memes, not guaranteed financial advice
          </div>

          <div className="nawab-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`nawab-message ${message.from}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="nawab-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="nawab-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Bol Nawab, kya scene hai?"
              aria-label="Message Nuksaan Nawab"
              maxLength={300}
            />

            <button type="submit" aria-label="Send message">
              ➤
            </button>
          </form>
        </section>
      )}

      <button
        className="nawab-launcher"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {open ? "✕ Close" : "🤡 Nuksaan Nawab"}
      </button>
    </div>
  );
}
