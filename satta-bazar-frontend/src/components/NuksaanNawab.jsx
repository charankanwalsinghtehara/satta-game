
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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const messagesRef = useRef(null);
  const requestInProgress = useRef(false);

  // Text-to-Speech
  function speakReply(text) {
    if (!("speechSynthesis" in window)) {
      setError("Voice is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "hi-IN";
    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => setSpeaking(true);
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(speech);
  }

  function stopVoice() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function toggleVoice() {
    if (voiceEnabled) {
      stopVoice();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  }

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open, loading]);

  // Stop voice when component is removed
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function sendMessage(value = input) {
    const text = value.trim();

    if (!text || requestInProgress.current || loading) return;

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

      const reply = data.reply.trim();

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-bot`,
          from: "bot",
          text: reply,
        },
      ]);

      // Automatically speak AI response when voice is enabled
      if (voiceEnabled) {
        speakReply(reply);
      }

    } catch (err) {
      setError(
        err?.message ||
          "Nawab abhi unavailable hai. Thodi der baad try karo."
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  function resetChat() {
    if (requestInProgress.current) return;

    stopVoice();

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
              className={`nawab-voice-toggle ${voiceEnabled ? "active" : ""}`}
              onClick={toggleVoice}
              title={voiceEnabled ? "Turn voice off" : "Turn voice on"}
              aria-label="Toggle voice"
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            {speaking && (
              <button
                type="button"
                onClick={stopVoice}
                title="Stop speaking"
                aria-label="Stop voice"
              >
                ⏹
              </button>
            )}

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
              onClick={() => {
                stopVoice();
                setOpen(false);
              }}
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
                <span>{message.text}</span>

                {message.from === "bot" && (
                  <button
                    type="button"
                    className="nawab-speak-button"
                    onClick={() => speakReply(message.text)}
                    title="Listen to reply"
                    aria-label="Listen to this reply"
                  >
                    🔊
                  </button>
                )}
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
