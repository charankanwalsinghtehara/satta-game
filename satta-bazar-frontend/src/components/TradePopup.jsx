
import Swal from "sweetalert2";
import { playTradeSound } from "../utils/tradeSounds";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

const reactions = {
  buy: {
    heading: "ENTRY LE LI, NAWAB! 🚀",
    emoji: "🫡📈",
    label: "ENTRY WALA CONFIDENCE",
    caption:
      "Buy button dab gaya. Ab portfolio ko grow karne de—har 3 second chart ko ghoorne se price sharma ke nahi badhega. 😂",
    source: "Buy reaction",
    color: "#4ade80",
  },
  profit: {
    heading: "PROFIT KI KHUSHBOO! 🤑",
    emoji: "🤑💸",
    label: "GREEN ZONE DRAMA",
    caption:
      "Profit dikha toh Nawab ne khud ko market ka damaad samajh liya. Screenshot le, par risk management ko block mat kar. 👑",
    source: "Profit reaction",
    color: "#4ade80",
  },
  loss: {
    heading: "PORTFOLIO KO CHOT LAGI 💀",
    emoji: "🤡📉",
    label: "EMOTIONAL DAMAGE",
    caption:
      "Market ne phir reality check de diya. Revenge trade karke loss ka sequel mat bana—pehle saans le, phir numbers dekh. 😭",
    source: "Loss reaction",
    color: "#fb7185",
  },
  sell: {
    heading: "EXIT KAR DIYA! 💸",
    emoji: "🚪🫡",
    label: "EXIT WALA SCENE",
    caption:
      "Position se exit ho gaya, Nawab. P&L confirm kiye bina victory lap ya maatam shuru mat kar. 😂",
    source: "Sell reaction",
    color: "#fbbf24",
  },
  neutral: {
    heading: "TRADE CONFIRMED! 🎮",
    emoji: "🎮🫡",
    label: "MARKET KA REALITY CHECK",
    caption:
      "Trade execute ho gaya. Profit ya loss ka verdict numbers denge—Nawab ka overconfidence department nahi. 🤡",
    source: "Trade reaction",
    color: "#a78bfa",
  },
};

function classifyOutcome(type, message = "") {
  const text = String(message).toLowerCase();

  const lossPattern =
    /\b(loss|losing|lost|nuksaan|nuksan|ghata|negative|red|down)\b|loss mein|ghate mein/;

  const profitPattern =
    /\b(profit|profitable|gain|gained|earned|kamaya|munafa|positive|green)\b|profit mein|faayde mein/;

  // Avoid treating a generic trade roast as proof of actual P&L.
  if (lossPattern.test(text)) return "loss";
  if (profitPattern.test(text)) return "profit";

  return type === "buy" ? "buy" : "neutral";
}

function getReaction(type, message) {
  const outcome = classifyOutcome(type, message);
  return { outcome, reaction: reactions[outcome] };
}

export function showTradePopup(type, message = "") {
  const normalizedType = type === "sell" ? "sell" : "buy";
  const { outcome, reaction } = getReaction(normalizedType, message);

  const safeMessage = escapeHtml(
    message ||
      (normalizedType === "buy"
        ? "Virtual buy successful. Entry ho gayi!"
        : "Virtual sell successful. Exit ho gaya!"),
  );

  Swal.fire({
    title: reaction.heading,
    html: `
      <div style="text-align:center;">
        <p style="
          color:#e4e4e7;
          font-size:15px;
          line-height:1.6;
          margin:0 0 18px;
        ">${safeMessage}</p>

        <div style="
          border:1px solid #3f3f46;
          background:#09090b;
          border-radius:14px;
          padding:20px 16px;
          margin-top:12px;
        ">
          <div style="
            color:${reaction.color};
            font-size:11px;
            font-weight:800;
            letter-spacing:1.5px;
            margin-bottom:12px;
          ">${reaction.label}</div>

          <div
            role="img"
            aria-label="${escapeHtml(reaction.label)}"
            style="font-size:64px;line-height:1.3;margin:8px 0 14px;"
          >${reaction.emoji}</div>

          <p style="
            color:#e4e4e7;
            font-size:14px;
            line-height:1.7;
            margin:0;
          ">${escapeHtml(reaction.caption)}</p>

          <div style="
            color:#71717a;
            font-size:11px;
            margin-top:14px;
          ">${escapeHtml(reaction.source)} · Satta Meme Club</div>
        </div>

        <p style="
          color:#71717a;
          font-size:11px;
          margin:14px 0 0;
        ">
          Virtual money only. P&L ke liye portfolio numbers check karo. 😭
        </p>
      </div>
    `,
    background: "#18181b",
    color: "#fafafa",
    confirmButtonText: "Samajh Gaya 😂",
    confirmButtonColor: reaction.color,
    customClass: {
      popup: "satta-trade-popup",
      confirmButton: "satta-trade-confirm",
    },
    buttonsStyling: true,
    showCloseButton: true,
    allowOutsideClick: true,
    width: 480,
    didOpen: () => {
      // One context-matched sound per successful trade popup.
      void playTradeSound(normalizedType, outcome);
    },
  });
}
