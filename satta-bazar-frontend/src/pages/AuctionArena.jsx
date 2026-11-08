
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Gavel,
  Users,
  Clock3,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  RefreshCw,
  Wallet,
  MessageCircle,
  Sparkles,
  ChevronUp,
} from "lucide-react";

import {
  getAuctionLots,
  getAuctionBids,
  placeAuctionBid,
} from "../../services/api";



const AUDIENCE = [
  { name: "Sharma Ji", avatar: "👨🏻", lines: [
    "Beta, itne mein toh poori dukaan aa jaati!",
    "Pehle ghar ka budget toh sambhaal le!",
    "Wah beta, paisa udaane ka talent hai!",
  ]},
  { name: "Punjabi Uncle", avatar: "🧔🏽", lines: [
    "O paaji, chak de phatte! 💪",
    "Eh bid hai ya gareebi da invitation?",
    "Kinne paise ne tere kol, puttar?",
  ]},
  { name: "Chai Wala", avatar: "🫖", lines: [
    "Chai peelo, decision thanda ho jayega!",
    "Itna paisa chai mein laga dete!",
    "Ek cutting chai aur ek lakh ki bid!",
  ]},
  { name: "Meme Lord", avatar: "🗿", lines: [
    "Bro thinks he's Ambani 💀",
    "Financial advisor left the chat.",
    "Risk management entered the room and left.",
  ]},
  { name: "Bunty", avatar: "😎", lines: [
    "Bhai main hota toh double laga deta!",
    "Kya auction hai, kya personality hai!",
    "Mummy ko mat batana bas!",
  ]},
];

const AUCTIONEER_LINES = [
  "Aaiye aaiye! Paisa hai toh lagaiye! 💰",
  "Ek baar, do baar... koi toh bolo bhai!",
  "Itni khamoshi? Kya sabka wallet so raha hai?",
  "Oho! Kya zabardast bid aayi hai!",
  "Yeh auction hai ya family WhatsApp group ka drama?",
  "Bhai sahab ne toh market mein aag laga di!",
  "Paisa bolta hai, aur aaj toh cheekh raha hai!",
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function playAuctionSound(type, enabled) {
  if (!enabled) return;

  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    if (type === "bid") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        920,
        context.currentTime + 0.12
      );
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.22
      );
      oscillator.start();
      oscillator.stop(context.currentTime + 0.22);
    } else {
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      oscillator.frequency.setValueAtTime(
        660,
        context.currentTime + 0.12
      );
      oscillator.frequency.setValueAtTime(
        880,
        context.currentTime + 0.24
      );
      gain.gain.setValueAtTime(0.14, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.55
      );
      oscillator.start();
      oscillator.stop(context.currentTime + 0.55);
    }

    oscillator.onended = () => context.close();
  } catch (error) {
    console.warn("Auction sound unavailable:", error);
  }
}

function getList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || data?.items || [];
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}

export default function AuctionArena({
  user,
  balance = 0,
  onLogin,
  onBalanceRefresh,
}) {
  const [lots, setLots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState(
    "Aaj ka auction shuru hone wala hai! Seat belt baandh lo! 🎤"
  );
  const [audienceMessages, setAudienceMessages] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [remaining, setRemaining] = useState(0);

  const audienceIndex = useRef(0);
  const lastBidId = useRef(null);
  const previousBid = useRef(null);

  const selectedLot =
    lots.find((lot) => String(lot.id) === String(selectedId)) ||
    lots[0] ||
    null;

  const fetchLots = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await getAuctionLots();

      const items = getList(response);

      setLots(items);

      setSelectedId((current) => {
        if (items.some((lot) => String(lot.id) === String(current))) {
          return current;
        }

        const live = items.find((lot) => lot.status === "live");
        return live?.id ?? items[0]?.id ?? null;
      });

      setError("");
    } catch (err) {
      setError(err.message || "Could not load auction items.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBids = useCallback(async (lotId) => {
    if (!lotId) return;

    try {
      const response = await getAuctionBids(lotId);
      const items = getList(response);

      setBids(items);

      const newest = items[0];

      if (newest && lastBidId.current !== newest.id) {
        if (lastBidId.current !== null) {
          playAuctionSound("bid", soundEnabled);

          const oldBid = previousBid.current;
          const isMyBid = newest.bidder === user?.username;

          if (isMyBid) {
            setAnnouncement(
              "Bhai ne toh dhamaka kar diya! Aap highest bidder ho! 🔥"
            );
          } else if (oldBid && newest.amount > oldBid) {
            setAnnouncement(
              `${newest.bidder} ne aapko outbid kar diya! Ab kya karoge? 😭`
            );
          } else {
            setAnnouncement(
              `${newest.bidder} ne ${money(newest.amount)} BB ki bid lagayi!`
            );
          }

          setAudienceMessages((current) => [
            {
              id: `${Date.now()}-${Math.random()}`,
              name: "Live Audience",
              avatar: "📢",
              text: isMyBid
                ? "Oye hoye! Apna banda lead kar raha hai!"
                : "Oho! Nayi bid! Wallet sambhalo!",
            },
            ...current,
          ].slice(0, 8));
        }

        lastBidId.current = newest.id;
        previousBid.current = Number(newest.amount);
      }
    } catch (err) {
      console.warn("Bid history refresh failed:", err);
    }
  }, [soundEnabled, user]);

  useEffect(() => {
    fetchLots();

    const interval = window.setInterval(() => {
      fetchLots(true);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [fetchLots]);

  useEffect(() => {
    if (!selectedLot?.id) return;

    lastBidId.current = null;
    previousBid.current = null;
    setBids([]);

    fetchBids(selectedLot.id);

    const interval = window.setInterval(() => {
      fetchBids(selectedLot.id);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedLot?.id, fetchBids]);

  useEffect(() => {
    if (!selectedLot?.ends_at) {
      setRemaining(0);
      return;
    }

    const update = () => {
      const seconds = Math.max(
        0,
        Math.floor(
          (new Date(selectedLot.ends_at).getTime() - Date.now()) / 1000
        )
      );

      setRemaining(seconds);
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [selectedLot?.ends_at]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const person =
        AUDIENCE[audienceIndex.current % AUDIENCE.length];

      const line =
        person.lines[
          Math.floor(Math.random() * person.lines.length)
        ];

      audienceIndex.current += 1;

      setAudienceMessages((current) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          name: person.name,
          avatar: person.avatar,
          text: line,
        },
        ...current,
      ].slice(0, 8));
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAnnouncement(
        AUCTIONEER_LINES[
          Math.floor(Math.random() * AUCTIONEER_LINES.length)
        ]
      );
    }, 12000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedLot) return;

    const minimum =
      Number(selectedLot.current_bid) > 0
        ? Number(selectedLot.current_bid) +
          Number(selectedLot.minimum_increment)
        : Number(selectedLot.starting_price);

    setBidAmount(minimum.toFixed(2));
  }, [
    selectedLot?.id,
    selectedLot?.current_bid,
    selectedLot?.minimum_increment,
    selectedLot?.starting_price,
  ]);

  async function handleBid(event) {
    event.preventDefault();

    if (!user) {
      onLogin?.();
      return;
    }

    if (!selectedLot || bidding) return;

    const amount = Number(bidAmount);

    const minimum =
      Number(selectedLot.current_bid) > 0
        ? Number(selectedLot.current_bid) +
          Number(selectedLot.minimum_increment)
        : Number(selectedLot.starting_price);

    if (!Number.isFinite(amount) || amount < minimum) {
      setError(`Minimum bid is ${money(minimum)} BB.`);
      return;
    }

    if (amount > Number(balance)) {
      setError("Bhai, wallet mein itne paise nahi hain! 💸");
      return;
    }

    setBidding(true);
    setError("");

    try {
      const result = await placeAuctionBid(selectedLot.id, {
        amount: amount.toFixed(2),
        idempotency_key: crypto.randomUUID(),
      });

      playAuctionSound("bid", soundEnabled);

      setAnnouncement(
        "BID ACCEPTED! Ab dekho kaun deta hai takkar! 🔥"
      );

      setAudienceMessages((current) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          name: "Auction Crowd",
          avatar: "🎉",
          text: "OYE HOYE! BID LAG GAYI! 🔥",
        },
        ...current,
      ].slice(0, 8));

      if (result.auction) {
        setLots((current) =>
          current.map((lot) =>
            lot.id === selectedLot.id ? result.auction : lot
          )
        );
      }

      await Promise.all([
        fetchLots(true),
        fetchBids(selectedLot.id),
      ]);

      onBalanceRefresh?.();
    } catch (err) {
      setError(err.message || "Bid failed. Try again.");
    } finally {
      setBidding(false);
    }
  }

  function changeBid(direction) {
    const increment = Number(selectedLot?.minimum_increment || 50);
    const minimum =
      Number(selectedLot?.current_bid || 0) > 0
        ? Number(selectedLot.current_bid) + increment
        : Number(selectedLot?.starting_price || 0);

    const current = Number(bidAmount || minimum);

    setBidAmount(
      Math.max(minimum, current + direction * increment).toFixed(2)
    );
  }

  if (loading && !lots.length) {
    return (
      <div className="auction-loading">
        <Gavel size={34} />
        <h2>Auction ka parda uth raha hai...</h2>
        <p>Sharma ji apna wallet check kar rahe hain.</p>
      </div>
    );
  }

  return (
    <div className="auction-page">
      <header className="auction-hero">
        <div>
          <div className="auction-eyebrow">
            <span className="auction-live-dot" />
            THE GREAT INDIAN BAZAR AUCTION
          </div>

          <h1>
            Boli Lagao,
            <span> Izzat Bachao! 🔨</span>
          </h1>

          <p>
            Paisa tumhara, drama humara. Jo sabse zyada bolega,
            wahi leke jayega!
          </p>
        </div>

        <div className="auction-hero-actions">
          <div className="auction-wallet">
            <Wallet size={17} />
            <div>
              <small>YOUR BAZAR BUCKS</small>
              <strong>{money(balance)} BB</strong>
            </div>
          </div>

          <button
            className="auction-icon-button"
            onClick={() => setSoundEnabled((value) => !value)}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            type="button"
          >
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </button>

          <button
            className="auction-icon-button"
            onClick={() => fetchLots()}
            title="Refresh auctions"
            type="button"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <div className="auction-announcer">
        <div className="auctioneer-avatar">🎙️</div>

        <div className="auction-announcer-copy">
          <strong>AUCTION MASTER JI</strong>
          <p>{announcement}</p>
        </div>

        <Sparkles className="auction-sparkle" size={23} />
      </div>

      {error && (
        <div className="auction-error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <div className="auction-layout">
        <main className="auction-main">
          <section className="auction-stage">
            {selectedLot ? (
              <>
                <div className="auction-stage-top">
                  <span className="auction-lot-tag">
                    LOT #{selectedLot.id}
                  </span>

                  <span
                    className={`auction-status ${selectedLot.status}`}
                  >
                    <span />
                    {selectedLot.status}
                  </span>
                </div>

                <div className="auction-item-art">
                  <div className="auction-art-glow" />
                  <span>{selectedLot.emoji || "🎁"}</span>
                  <div className="auction-art-label">
                    EXCLUSIVE AUCTION ITEM
                  </div>
                </div>

                <h2>{selectedLot.name}</h2>

                <p className="auction-description">
                  {selectedLot.description}
                </p>

                <div className="auction-countdown">
                  <Clock3 size={18} />
                  <div>
                    <small>
                      {selectedLot.status === "live"
                        ? "TIME REMAINING"
                        : "AUCTION TIME"}
                    </small>

                    <strong>
                      {selectedLot.status === "live"
                        ? formatTime(remaining)
                        : selectedLot.status.toUpperCase()}
                    </strong>
                  </div>
                </div>

                <div className="auction-price-grid">
                  <div>
                    <small>STARTING PRICE</small>
                    <strong>
                      ₹{money(selectedLot.starting_price)}
                    </strong>
                  </div>

                  <div className="auction-current-price">
                    <small>CURRENT BID</small>
                    <strong>
                      ₹{money(selectedLot.current_bid)}
                    </strong>
                  </div>

                  <div>
                    <small>MINIMUM NEXT BID</small>
                    <strong>
                      ₹
                      {money(
                        selectedLot.current_bid > 0
                          ? Number(selectedLot.current_bid) +
                              Number(selectedLot.minimum_increment)
                          : selectedLot.starting_price
                      )}
                    </strong>
                  </div>
                </div>

                <div className="auction-leader">
                  <Trophy size={19} />
                  <div>
                    <small>CURRENT HIGHEST BIDDER</small>
                    <strong>
                      {selectedLot.highest_bidder || "No bids yet"}
                    </strong>
                  </div>
                  <span>👑</span>
                </div>

                {selectedLot.status === "live" && remaining > 0 ? (
                  <form
                    className="auction-bid-form"
                    onSubmit={handleBid}
                  >
                    <label htmlFor="auction-bid-amount">
                      ENTER YOUR BID (BAZAR BUCKS)
                    </label>

                    <div className="auction-bid-controls">
                      <button
                        type="button"
                        onClick={() => changeBid(-1)}
                        aria-label="Decrease bid"
                      >
                        −
                      </button>

                      <input
                        id="auction-bid-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={bidAmount}
                        onChange={(event) =>
                          setBidAmount(event.target.value)
                        }
                        required
                      />

                      <button
                        type="button"
                        onClick={() => changeBid(1)}
                        aria-label="Increase bid"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="auction-bid-button"
                      type="submit"
                      disabled={bidding}
                    >
                      <Gavel size={19} />
                      {bidding
                        ? "BID LAG RAHI HAI..."
                        : "LAGAO BOLI! 🔨"}
                    </button>

                    <p className="auction-bid-note">
                      Your previous leading bid is refunded if another
                      player outbids you.
                    </p>
                  </form>
                ) : (
                  <div className="auction-closed-message">
                    {selectedLot.status === "sold"
                      ? `🏆 SOLD! Winner: ${selectedLot.winner || "Winner"}`
                      : selectedLot.status === "unsold"
                        ? "Nobody bid. Sharma ji ne bhi haath peeche kar liya."
                        : "Auction is not open for bidding yet."}
                  </div>
                )}
              </>
            ) : (
              <div className="auction-empty">
                <Gavel size={44} />
                <h2>Abhi koi auction nahi hai!</h2>
                <p>Admin panel se auction items create karo.</p>
              </div>
            )}
          </section>

          <section className="auction-lots-section">
            <div className="auction-section-heading">
              <div>
                <span>THE CATALOGUE</span>
                <h2>Items going under the hammer</h2>
              </div>
              <span>{lots.length} LOTS</span>
            </div>

            <div className="auction-lots-grid">
              {lots.map((lot) => (
                <button
                  type="button"
                  key={lot.id}
                  className={`auction-lot-card ${
                    String(selectedId) === String(lot.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedId(lot.id)}
                >
                  <span className="auction-lot-emoji">
                    {lot.emoji || "🎁"}
                  </span>

                  <span className={`auction-lot-status ${lot.status}`}>
                    {lot.status}
                  </span>

                  <strong>{lot.name}</strong>

                  <small>
                    Current: ₹{money(lot.current_bid)}
                  </small>

                  <span className="auction-lot-open">
                    View auction <ChevronUp size={14} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="auction-bid-history">
            <div className="auction-section-heading">
              <div>
                <span>LIVE ACTIVITY</span>
                <h2>Who is throwing money?</h2>
              </div>
              <Flame size={21} />
            </div>

            {bids.length ? (
              bids.slice(0, 8).map((bid, index) => (
                <div className="auction-bid-row" key={bid.id}>
                  <span className="auction-bid-rank">
                    {index === 0 ? "👑" : `#${index + 1}`}
                  </span>

                  <div>
                    <strong>{bid.bidder}</strong>
                    <small>
                      {new Date(bid.created_at).toLocaleTimeString(
                        "en-IN"
                      )}
                    </small>
                  </div>

                  <strong className="auction-bid-value">
                    ₹{money(bid.amount)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="auction-no-bids">
                Abhi tak kisi ne paisa nahi lagaya. Pehle tum bano!
              </p>
            )}
          </section>
        </main>

        <aside className="auction-audience">
          <div className="auction-audience-heading">
            <div>
              <span>LIVE CROWD</span>
              <h2>
                <Users size={19} /> Public ki awaaz
              </h2>
            </div>

            <span className="auction-crowd-count">
              <span /> LIVE
            </span>
          </div>

          <div className="auction-crowd-banner">
            <div className="auction-crowd-faces">
              👨🏻‍🦱 👳🏽‍♂️ 👩🏻‍🦰 🧔🏽
            </div>
            <strong>Public pagal ho rahi hai!</strong>
            <small>Taali bhi, gaali bhi. Sab milega.</small>
          </div>

          <div className="auction-comments">
            {audienceMessages.map((message) => (
              <div className="auction-comment" key={message.id}>
                <span className="auction-comment-avatar">
                  {message.avatar}
                </span>

                <div>
                  <strong>{message.name}</strong>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}

            {!audienceMessages.length && (
              <div className="auction-audience-empty">
                <MessageCircle size={26} />
                <p>Audience ki entry hone wali hai...</p>
              </div>
            )}
          </div>

          <div className="auction-crowd-footer">
            <span>📣</span>
            <p>
              Public ka opinion free hai. Unka advice lena mehenga
              pad sakta hai.
            </p>
          </div>
        </aside>
      </div>

      <footer className="auction-footer-note">
        <span>🎭</span>
        Satta Bazar Auction Arena · Virtual Bazar Bucks only ·
        Entertainment mode
      </footer>
    </div>
  );
}
