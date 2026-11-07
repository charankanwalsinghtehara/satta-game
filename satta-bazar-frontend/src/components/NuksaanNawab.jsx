
import { useEffect, useRef, useState } from "react";
import { sendNuksaanNawabMessage } from "../../services/api";
import "./NuksaanNawab.css";

const suggestions = [
  "Roast me 🤡",
  "Market crash 📉",
  "Buy scene 😂",
  "Profit celebration 🤑",
  "Portfolio roast 💼",
];

const welcomeMessage = {
  id: "welcome",
  from: "bot",
  text: "Adaab, mere Nawab! 👑 Main Nuksaan Nawab—market ka meme-baz. Buy, sell, profit, loss, recovery ya portfolio roast karwao. Jokes guaranteed; market predictions nahi! 😂",
};

export default function NuksaanNawab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesRef = useRef(null);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open, loading]);

  async function sendMessage(value = input) {
    const text = value.trim();

    if (!text || requestInProgress.current || loading) {
      return;
    }

    if (text.length > 300) {
      setError("Message 300 characters se chhota rakho.");
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    setError("");
    setInput("");

    const userMessage = {
      id: `${Date.now()}-user`,
      from: "user",
      text,
    };

    // Send only actual conversation messages, excluding the welcome message.
    const history = messages
      .filter((message) => message.id !== "welcome")
      .map((message) => ({
        role: message.from === "user" ? "user" : "assistant",
        content: message.text,
      }));

    setMessages((current) => [...current, userMessage]);

    try {
      const data = await sendNuksaanNawabMessage(text, history);

      if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("AI service returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-bot`,
          from: "bot",
          text: data.reply.trim(),
        },
      ]);
    } catch (err) {
      setError(
        err?.message ||
          "Nawab abhi unavailable hai. Thodi der baad try karo.",
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  function resetChat() {
    if (requestInProgress.current) return;

    setMessages([
      {
        ...welcomeMessage,
        id: `${Date.now()}-welcome`,
        text: "Nayi mehfil, naya drama! 😂 Bol Nawab, kis market scene ka roast chahiye?",
      },
    ]);

    setError("");
    setInput("");
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
              disabled={loading}
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

            {loading && (
              <div className="nawab-message bot">
                Nawab soch raha hai... 🤔
              </div>
            )}

            {error && (
              <div className="nawab-message bot">
                {error}
              </div>
            )}
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
                disabled={loading}
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
              disabled={loading}
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || loading}
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
