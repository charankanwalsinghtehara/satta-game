
import { useEffect, useRef, useState } from "react";
import "./NuksaanNawab.css";

const replyBank = {
  greeting: [
    "Adaab, Nawab sahab! 👑 Market ka comedian hazir hai. Crystal ball abhi bhi buffering pe hai. 😂",
    "Oye sher! 🤡 Portfolio ka haal bata, ya seedha apni strategy ki post-mortem karwayein?",
    "Salaam, investor sahab! Aaj market ne izzat di ya phir public mein roast kiya? 💀",
  ],

  buy: [
    "Entry le li? Wah Nawab, button dabane ki speed Olympic level ki hai. Ab risk limit aur exit plan bhi dikha do. 😂",
    "Buy ho gaya, boss! Ab har red candle ko personal dushman samajh ke refresh mat karte rehna. 📉",
    "Entry ke time confidence full HD, planning 144p? 😂 Position size aur risk pe bhi thoda pyaar barsa.",
    "Nawab ne market mein entry maar di! 🚀 Bas FOMO ko apna portfolio manager mat banana.",
  ],

  sell: [
    "Exit ka button mil gaya, mubarak ho! 😂 Ab P&L check kar—exit hua hai, trophy automatically nahi mili.",
    "Bech diya? Theek hai, Nawab. Har exit victory nahi aur har exit failure bhi nahi. Numbers ko bolne de.",
    "Position se bahar aa gaye, sahab! 🚪 Ab 'ek candle aur ruk jaata' wali film ka sequel mat banana. 💀",
  ],

  loss: [
    "Aah, portfolio laal hai. 🍅 Market ne tujhe investor se ketchup bana diya! Revenge trading mat kar—pehle break, phir risk review.",
    "Nuksaan hua aur dimaag bol raha hai 'double karke recover karunga'? Bhai, yeh trading hai, casino ka boss level nahi. 💀",
    "Market ne confidence ka recharge khatam kar diya kya? 😂 Loss ko chase karna aag pe petrol daalne jaisa ho sakta hai.",
    "Aaj market ne tera ego stop-loss kar diya. 🤡 Thoda pause le; ek loss ko teen losses ki franchise mat bana.",
  ],

  profit: [
    "OHO, green numbers! 🤑 Nawab sahab ab khud ko Dalal Street ka sultan samajh rahe hain!",
    "Profit aaya aur attitude ka IPO launch ho gaya! 😂 Ek green result ko lifetime guarantee mat samajhna.",
    "Mubarak ho, sher! 👑 Bas profit dekh ke risk limit ko retirement pe mat bhej dena.",
    "Portfolio green? Aaj biryani, kal bhi risk management. 🤑 Overconfidence ka bill market kabhi bhi bhej sakta hai.",
  ],

  portfolio: [
    "Portfolio ka family function chal raha hai kya? 😂 Har holding ko jagah dene se pehle uska risk aur role samajh.",
    "Nawab, portfolio sirf green-red ka wallpaper nahi. Open positions, current value aur realised P&L bhi dekh.",
    "Saara paisa ek hi jagah? Bhai, portfolio nahi, one-man band hai. 🎸 Concentration risk samajhna zaroori hai.",
  ],

  market: [
    "Market roller coaster hai, Nawab. 🎢 Seat belt ka naam risk management hai; aankh band karke baithna strategy nahi.",
    "Bull market mein sab genius, bear market mein sab philosopher. 😂 Plan dono seasons ke liye chahiye.",
    "Chart ko dekh, par candle mein apna future mat dhoondh. 🔮 Crystal ball ka server permanently down hai.",
  ],

  roast: [
    "Teri strategy itni secret hai ki tujhe khud bhi nahi pata kya chal raha hai. 💀",
    "Confidence: 100%. Research: 'Bhai ne group mein bola tha.' 😂",
    "Tu buy button aise dabata hai jaise last samosa tere saamne ho. 🥟",
    "Risk management tujhe dhoondh raha hai. Phone utha le, Nawab! 📞🤡",
    "Portfolio ko strategy chahiye, tu usko motivational quotes de raha hai. 😭",
  ],

  recover: [
    "Loss recover karne ki jaldi mein double risk lena? Wah, aag lagi hai toh petrol ki bucket bhi le aa. 💀 Pehle ruk, position aur risk review kar.",
    "Bhai, market tera udhaar nahi jo kal pakka wapas karega. 😂 Recovery guaranteed nahi hoti; impulsive trades se bach.",
    "Mission 'loss wapas lao' ko thoda pause kar. Dimaag thanda kar, actual P&L dekh, aur bina plan ke next trade mat lena.",
  ],

  tip: [
    "Sure-shot tip? Haan: market tujhe surprise kar sakta hai. 😂 Main memes aur basic risk reminders deta hoon, guaranteed calls nahi.",
    "Main Nuksaan Nawab hoon, Baba Predictanand nahi. 🔮 Price ka future ya guaranteed target invent nahi karunga.",
    "Tip chahiye toh pehle checklist: thesis kya hai, risk kitna hai, aur galat hue toh plan kya hai? Magic number mere paas nahi. 🤡",
  ],

  thanks: [
    "Shukriya, Nawab! 😂 Ab apne risk limits ko bhi ek thank-you bol dena.",
    "Anytime, sher! Main jokes free deta hoon; market ki tuition apne risk pe. 👑",
  ],

  help: [
    "Topic bol, Nawab: buy, sell, profit, loss, recovery, portfolio ya full roast. 😂",
    "Menu-e-bakchodi ready hai! 🤡 Apna market scene bata ya quick suggestion pe tap kar.",
  ],

  followup: [
    "Pichhli baat yaad hai, Nawab. 😂 Lekin mujhe abhi live portfolio numbers nahi dikh rahe. Apna actual P&L bata, phir usi scene ka roast karte hain.",
    "Haan bhai, usi market drama ka sequel chal raha hai. 🤡 Thoda detail de—trade execute hua, P&L badla, ya bas dimaag mein chart ghoom raha hai?",
  ],

  fallback: [
    "Bhai, itna suspense toh market opening mein bhi nahi hota. 😂 Buy, sell, profit, loss ya portfolio ka scene thoda clear kar.",
    "Samjha nahi, Nawab sahab. 🤡 Seedha bata kya hua—profit, nuksaan, entry, exit ya strategy ka roast?",
    "Mera crystal ball buffering pe hai. 🔮 Apna market scene ek line mein bata; phir roast relevant milega.",
  ],
};

const suggestions = [
  "Roast me 🤡",
  "Market crash 📉",
  "Buy scene 😂",
  "Profit celebration 🤑",
  "Portfolio roast 💼",
];

function chooseReply(category, lastReply = "") {
  const options = replyBank[category] || replyBank.fallback;
  const alternatives = options.filter((reply) => reply !== lastReply);

  return (alternatives.length ? alternatives : options)[
    Math.floor(Math.random() * (alternatives.length || options.length))
  ];
}

function detectIntent(message) {
  const text = message.toLowerCase().trim();

  const has = (...patterns) =>
    patterns.some((pattern) => pattern.test(text));

  // Check specific intents before broad market words.
  if (
    has(
      /\broast\b/,
      /\bbeizzati\b/,
      /\binsult me\b/,
      /\bbakchodi\b/,
      /\bmake fun\b/,
      /\bmazak uda\b/,
    )
  ) {
    return "roast";
  }

  if (
    has(
      /\bthank(?:s| you)?\b/,
      /\bshukriya\b/,
      /\bthx\b/,
      /\bdhanyavaad\b/,
    )
  ) {
    return "thanks";
  }

  if (
    has(
      /\brecover(?:y)?\b/,
      /\bpaise wapas\b/,
      /\bloss recover\b/,
      /\bnuksaan recover\b/,
      /\bwapas kama\b/,
      /\bmake it back\b/,
    )
  ) {
    return "recover";
  }

  if (
    has(
      /\bsure shot\b/,
      /\bguarantee(?:d)?\b/,
      /\bpredict(?:ion)?\b/,
      /\btarget\b/,
      /\bprice kaha\b/,
      /\btip\b/,
      /\bnext move\b/,
    )
  ) {
    return "tip";
  }

  if (
    has(
      /\bhello\b/,
      /\bhi\b/,
      /\bhey\b/,
      /\bnamaste\b/,
      /\badaab\b/,
      /\bkaise ho\b/,
      /\bsup\b/,
    )
  ) {
    return "greeting";
  }

  // Mixed P&L statements: prefer the latest explicit outcome.
  const lossMatch = Math.max(
    text.lastIndexOf("loss"),
    text.lastIndexOf("nuksaan"),
    text.lastIndexOf("nuksan"),
    text.lastIndexOf("ghata"),
    text.lastIndexOf("red"),
  );

  const profitMatch = Math.max(
    text.lastIndexOf("profit"),
    text.lastIndexOf("munafa"),
    text.lastIndexOf("kamaya"),
    text.lastIndexOf("green"),
    text.lastIndexOf("gain"),
  );

  const mentionsLoss = lossMatch >= 0;
  const mentionsProfit = profitMatch >= 0;

  if (mentionsLoss && mentionsProfit) {
    return lossMatch > profitMatch ? "loss" : "profit";
  }

  if (
    has(
      /\bloss\b/,
      /\bnuksaan\b/,
      /\bnuksan\b/,
      /\bghata\b/,
      /\bcrash\b/,
      /\bred\b/,
      /\bdown\b/,
      /\bgir raha\b/,
      /\bbear market\b/,
    )
  ) {
    return "loss";
  }

  if (
    has(
      /\bprofit\b/,
      /\bmunafa\b/,
      /\bkamaya\b/,
      /\bgain\b/,
      /\bgreen\b/,
      /\bcrorepati\b/,
      /\brich\b/,
      /\bpump\b/,
    )
  ) {
    return "profit";
  }

  if (
    has(
      /\bportfolio\b/,
      /\bholding(?:s)?\b/,
      /\binvestment\b/,
      /\bbalance\b/,
      /\bposition(?:s)?\b/,
      /\bp&l\b/,
    )
  ) {
    return "portfolio";
  }

  if (
    has(
      /\bsell\b/,
      /\bbech\b/,
      /\bexit\b/,
      /\bnikal du\b/,
      /\bnikal doon\b/,
    )
  ) {
    return "sell";
  }

  if (
    has(
      /\bbuy\b/,
      /\bkharid\b/,
      /\bpurchase\b/,
      /\bentry\b/,
      /\ble lu\b/,
    )
  ) {
    return "buy";
  }

  if (
    has(
      /\bmarket\b/,
      /\bstock\b/,
      /\bshare\b/,
      /\bnifty\b/,
      /\bsensex\b/,
      /\bbull\b/,
      /\basset\b/,
      /\bprice\b/,
      /\bcandle\b/,
    )
  ) {
    return "market";
  }

  if (
    has(
      /\bhelp\b/,
      /\bwhat should i do\b/,
      /\bkya karu\b/,
      /\bsuggest\b/,
      /\boptions\b/,
    )
  ) {
    return "help";
  }

  return "fallback";
}

function makeBotReply(message, previousIntent, lastBotReply) {
  const intent = detectIntent(message);
  const text = message.toLowerCase().trim();

  const followupPhrases = [
    "ab kya",
    "phir kya",
    "aur bata",
    "what now",
    "then what",
    "uske baad",
    "ab kya karu",
    "toh ab",
    "same thing",
    "aur",
  ];

  const isShortFollowup =
    text.split(/\s+/).length <= 5 &&
    followupPhrases.some((phrase) => text.includes(phrase));

  if (isShortFollowup && previousIntent) {
    const contextualReply = chooseReply(
      previousIntent,
      lastBotReply,
    );

    return {
      intent: previousIntent,
      text: contextualReply,
    };
  }

  return {
    intent,
    text: chooseReply(intent, lastBotReply),
  };
}

export default function NuksaanNawab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      from: "bot",
      text: "Adaab, mere Nawab! 👑 Main Nuksaan Nawab—market ka meme-baz. Buy, sell, profit, loss, recovery ya portfolio roast karwao. Jokes guaranteed; market predictions nahi! 😂",
    },
  ]);

  const [previousIntent, setPreviousIntent] = useState(null);
  const messagesRef = useRef(null);
  const lastBotReplyRef = useRef("");

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open]);

  function sendMessage(value = input) {
    const text = value.trim();
    if (!text) return;

    const result = makeBotReply(
      text,
      previousIntent,
      lastBotReplyRef.current,
    );

    const now = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: `${now}-user`,
        from: "user",
        text,
      },
      {
        id: `${now}-bot`,
        from: "bot",
        text: result.text,
      },
    ]);

    setPreviousIntent(result.intent);
    lastBotReplyRef.current = result.text;
    setInput("");
  }

  function resetChat() {
    setMessages([
      {
        id: `${Date.now()}-welcome`,
        from: "bot",
        text: "Nayi mehfil, naya drama! 😂 Bol Nawab, kis market scene ka roast chahiye?",
      },
    ]);

    setPreviousIntent(null);
    lastBotReplyRef.current = "";
  }

  return (
    <div className="nawab-chat">
      {open && (
        <section
          className="nawab-window"
          role="dialog"
          aria-label="Nuksaan Nawab chatbot"
          aria-modal="false"
        >
          <header className="nawab-header">
            <div className="nawab-avatar" aria-hidden="true">
              🤡
            </div>

            <div className="nawab-heading">
              <strong>Nuksaan Nawab</strong>
              <span>Market ka drama, jokes ke saath 👑</span>
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
            Virtual stock game · Humour only · No guaranteed calls
          </div>

          <div
            className="nawab-messages"
            aria-live="polite"
            ref={messagesRef}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`nawab-message ${message.from}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div
            className="nawab-suggestions"
            aria-label="Suggested messages"
          >
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

            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
            >
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

