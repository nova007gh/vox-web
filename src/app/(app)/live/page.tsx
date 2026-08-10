"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Eye,
  Heart,
  Gift,
  Send,
  Share2,
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  FlipHorizontal,
  Circle,
  ShoppingBag,
  Gavel,
  Check,
  Users,
  Sparkles,
  Search,
  TrendingUp,
  Crown,
  Smile,
  BarChart3,
  Trophy,
  User,
  Download,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getWallet,
  sendGift,
} from "@/lib/wallet-store";
import { createPost, uploadFile } from "@/lib/firebase-store";
import {
  getActiveStreams,
  startLiveStream,
  endLiveStream,
  incrementStreamViewers,
  getStreamById,
  addNotification,
  seedLiveDemoData,
  getLiveProducts,
  markProductSold,
  getLiveAuctions,
  placeBid,
  type LiveStream,
  type LiveProduct,
  type LiveAuction,
} from "@/lib/content-store";

/* ─────────────────────────── DATA ─────────────────────────── */

const categories = [
  { label: "All" },
  { label: "Music" },
  { label: "Dance" },
  { label: "Gaming" },
  { label: "Shopping" },
  { label: "Auctions" },
  { label: "Cooking" },
  { label: "Fashion" },
  { label: "Beauty" },
];

const goLiveCategories = [
  "Just Chatting", "Music", "Dance", "Gaming", "Shopping", "Cooking", "Fashion", "Beauty", "Q&A", "Tutorial",
];

const giftTiers = [
  { name: "Heart", icon: "❤️", cost: 50 },
  { name: "Rose", icon: "🌹", cost: 100 },
  { name: "Fire", icon: "🔥", cost: 200 },
  { name: "Diamond", icon: "💎", cost: 500 },
  { name: "Rocket", icon: "🚀", cost: 1000 },
  { name: "King", icon: "👑", cost: 5000 },
];

interface LiveComment {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  isGift?: boolean;
  giftIcon?: string;
}

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
    : `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString()}`;
}

function formatCountShort(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─────────────────────────── GO LIVE MODAL ─────────────────────────── */

function GoLiveModal({ onClose, onGoLive }: { onClose: () => void; onGoLive: (title: string, category: string, mediaStream: MediaStream | null) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Just Chatting");
  const [step, setStep] = useState<"permissions" | "setup">("permissions");
  const [cameraPermission, setCameraPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [micPermission, setMicPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streamHandedOff = useRef(false);

  const startPreview = useCallback(async () => {
    try {
      setCameraStarting(true);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available. Please use a modern browser over HTTPS.");
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
      setCameraError(null);
      setCameraPermission("granted");
      setMicPermission("granted");
    } catch (err) {
      console.error("Camera preview failed:", err);
      setCameraError("Camera/microphone access denied. You can still go live without camera.");
      setCameraPermission("denied");
      setMicPermission("denied");
      setCameraReady(false);
    } finally {
      setCameraStarting(false);
    }
  }, []);

  const requestCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setCameraPermission("granted");
      setCameraReady(true);
      setCameraError(null);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraPermission("denied");
    }
  };

  const requestMicrophone = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone API not available");
      }
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStream.getTracks().forEach((t) => t.stop());
      setMicPermission("granted");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicPermission("denied");
    }
  };

  const canContinue = cameraPermission === "granted" && micPermission === "granted";

  useEffect(() => {
    if (step === "setup") {
      startPreview();
    }
    return () => {
      if (streamRef.current && !streamHandedOff.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [step, startPreview]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black flex flex-col"
    >
      <div
        className="relative flex-1 flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingTop: "calc(var(--safe-top, 0px) + 16px)" }}
      >
        <button
          onClick={() => {
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            onClose();
          }}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
          style={{ top: "var(--safe-top, 16px)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {step === "permissions" ? (
          <div className="flex flex-col h-full items-center justify-center gap-6 px-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Go Live</h2>
              <p className="text-sm text-vox-muted max-w-[260px]">
                Allow access to your camera and microphone to start streaming.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={requestCamera}
                disabled={cameraPermission === "granted"}
                className={`w-full rounded-full py-4 text-sm font-bold touch-feedback flex items-center justify-center gap-2 transition-all disabled:opacity-80 ${
                  cameraPermission === "granted"
                    ? "bg-vox-green/20 text-vox-green border border-vox-green"
                    : "bg-white text-black"
                }`}
              >
                {cameraPermission === "granted" ? <><Check className="w-5 h-5" /> Camera enabled</> : <><Camera className="w-5 h-5" /> Access camera</>}
              </button>

              <button
                onClick={requestMicrophone}
                disabled={micPermission === "granted"}
                className={`w-full rounded-full py-4 text-sm font-bold touch-feedback flex items-center justify-center gap-2 transition-all disabled:opacity-80 ${
                  micPermission === "granted"
                    ? "bg-vox-green/20 text-vox-green border border-vox-green"
                    : "bg-white/15 text-white border border-white/10"
                }`}
              >
                {micPermission === "granted" ? <><Check className="w-5 h-5" /> Microphone enabled</> : <><Mic className="w-5 h-5" /> Access microphone</>}
              </button>
            </div>

            <button
              onClick={() => canContinue && setStep("setup")}
              disabled={!canContinue}
              className="w-full max-w-xs bg-gradient-to-r from-vox-danger to-vox-pink rounded-full py-4 text-sm font-bold text-white touch-feedback disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continue
            </button>

            {!canContinue && <p className="text-xs text-vox-muted">Enable both to continue</p>}
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4 pt-12">
            <div className="relative flex-1 rounded-3xl overflow-hidden bg-black border border-white/10">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                  <VideoOff className="w-16 h-16 text-vox-muted" />
                  <p className="text-white/70 text-center text-sm">{cameraError}</p>
                  <button onClick={startPreview} className="btn-gradient rounded-full px-5 py-2 text-sm font-semibold text-white touch-feedback">
                    Try Again
                  </button>
                </div>
              ) : cameraStarting ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
                  <p className="text-white/70 text-sm">Starting camera...</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  preload="auto"
                  onLoadedMetadata={() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }}
                  onCanPlay={() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              )}
              {cameraReady && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-vox-danger/90 backdrop-blur-md rounded-full px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span className="text-xs font-bold text-white">PREVIEW</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/50 backdrop-blur-md rounded-xl px-3 py-2">
                  <p className="text-sm font-semibold text-white truncate">{title || "Live Stream"}</p>
                  <p className="text-xs text-vox-muted">{category}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you streaming about?"
                className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-vox-pink/50"
                maxLength={100}
              />

              <div className="flex flex-wrap gap-2">
                {goLiveCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full touch-feedback transition-all ${
                      category === cat ? "btn-gradient text-white" : "glass text-vox-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  streamHandedOff.current = true;
                  onGoLive(title || "Live Stream", category, streamRef.current);
                }}
                className="w-full bg-gradient-to-r from-vox-danger to-vox-pink rounded-2xl py-4 text-sm font-bold text-white touch-feedback flex items-center justify-center gap-2"
              >
                <Radio className="w-5 h-5" />
                Go Live
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── BUY NOW MODAL ─────────────────────────── */

function BuyNowModal({ product, onClose, onBuy }: { product: LiveProduct; onClose: () => void; onBuy: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl w-full max-w-sm overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-white">{product.name}</h3>
          <p className="text-sm text-vox-muted">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-vox-pink">{formatPrice(product.price, product.currency)}</span>
            <span className="text-xs text-vox-muted">Live exclusive price</span>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 glass rounded-2xl py-3 text-sm font-bold text-vox-muted touch-feedback">
              Cancel
            </button>
            <button
              onClick={onBuy}
              className="flex-[2] bg-gradient-to-r from-vox-purple to-vox-pink rounded-2xl py-3 text-sm font-bold text-white touch-feedback flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── BID MODAL ─────────────────────────── */

function BidModal({ auction, onClose, onBid }: { auction: LiveAuction; onClose: () => void; onBid: (amount: number) => boolean }) {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 100);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = onBid(bidAmount);
    if (!result) {
      setError("Bid must be higher than current bid");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl w-full max-w-sm overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={auction.image} alt={auction.itemName} className="w-full h-40 object-cover" />
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-bold text-white">{auction.itemName}</h3>
          <p className="text-sm text-vox-muted">{auction.description}</p>
          <div className="glass rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vox-muted">Current Bid</span>
              <span className="text-sm font-bold text-vox-pink">{formatPrice(auction.currentBid, auction.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vox-muted">Bids</span>
              <span className="text-sm font-bold text-white">{auction.bids}</span>
            </div>
            {auction.highestBidder && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-vox-muted">Highest Bidder</span>
                <span className="text-sm font-bold text-vox-cyan">{auction.highestBidder}</span>
              </div>
            )}
          </div>
          {error && <p className="text-xs text-vox-danger">{error}</p>}
          <div>
            <label className="text-sm font-medium text-vox-muted block mb-1.5">Your Bid ({auction.currency})</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => { setBidAmount(Number(e.target.value)); setError(null); }}
              min={auction.currentBid + 1}
              className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-vox-pink/50"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 glass rounded-2xl py-3 text-sm font-bold text-vox-muted touch-feedback">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] bg-gradient-to-r from-vox-orange to-vox-pink rounded-2xl py-3 text-sm font-bold text-white touch-feedback flex items-center justify-center gap-2"
            >
              <Gavel className="w-4 h-4" />
              Place Bid
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── LIVE STREAM VIEWER ─────────────────────────── */

function StreamViewer({ stream, onClose }: { stream: LiveStream; onClose: () => void }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [viewers, setViewers] = useState(stream.viewers);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 2000) + 500);
  const [showGifts, setShowGifts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<{ id: number; icon: string }[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; size: number }[]>([]);
  const [giftBurst, setGiftBurst] = useState<{ icon: string; name: string; cost: number; nonce: number } | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [poll, setPoll] = useState({
    question: `What should ${stream.hostName} do next?`,
    voted: null as string | null,
    options: [
      { id: "qa", label: "Q&A", votes: 128 },
      { id: "music", label: "Play music", votes: 207 },
      { id: "guest", label: "Add a guest", votes: 86 },
    ],
  });
  const [toast, setToast] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [buyProduct, setBuyProduct] = useState<LiveProduct | null>(null);
  const [bidAuction, setBidAuction] = useState<LiveAuction | null>(null);
  const [showShopping, setShowShopping] = useState(false);
  const [showAuctions, setShowAuctions] = useState(false);
  const [giftCombo, setGiftCombo] = useState<{ icon: string; name: string; count: number; nonce: number } | null>(null);
  const [topGifters, setTopGifters] = useState<{ name: string; avatar: string; coins: number; icon: string }[]>([]);
  const [viewerPulse, setViewerPulse] = useState(false);
  const [showTopGifters, setShowTopGifters] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const giftIdRef = useRef(0);
  const heartIdRef = useRef(0);
  const streamIdRef = useRef(stream.id);
  const giftComboRef = useRef<{ icon: string; name: string; count: number; nonce: number } | null>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const streamId = streamIdRef.current;
    incrementStreamViewers(streamId, 1);
    setViewers((getStreamById(streamId)?.viewers) || 1);
    setProducts(getLiveProducts(streamId));
    setAuctions(getLiveAuctions(streamId));

    const interval = setInterval(() => {
      const s = getStreamById(streamId);
      if (s) {
        setViewers((prev) => {
          if (s.viewers > prev) setViewerPulse(true);
          return s.viewers;
        });
      }
      setProducts(getLiveProducts(streamId));
      setAuctions(getLiveAuctions(streamId));
    }, 3000);

    // Simulated top gifters
    const giftersInterval = setInterval(() => {
      setTopGifters([
        { name: "AmaFan123", avatar: "", coins: 3200 + Math.floor(Math.random() * 800), icon: "💎" },
        { name: "EsiLovesHair", avatar: "", coins: 1850 + Math.floor(Math.random() * 400), icon: "🔥" },
        { name: "GlowSeeker", avatar: "", coins: 920 + Math.floor(Math.random() * 200), icon: "🌹" },
        { name: "NaturalQueen", avatar: "", coins: 480 + Math.floor(Math.random() * 100), icon: "❤️" },
        { name: "HairLover", avatar: "", coins: 150 + Math.floor(Math.random() * 50), icon: "🚀" },
      ].sort((a, b) => b.coins - a.coins));
    }, 5000);

    // Reset viewer pulse
    const pulseInterval = setInterval(() => setViewerPulse(false), 600);

    const simComments = [
      { user: "AmaFan123", text: "The wig is gorgeous! 💇‍♀️" },
      { user: "EsiLovesHair", text: "Love from Kumasi! Booking now" },
      { user: "GlowSeeker", text: "How much for the frontal? 💰" },
      { user: "NaturalQueen", text: "Drop the link!! 🙌" },
      { user: "Viewer", text: "Hey! Nice stream 🔥" },
      { user: "Fan", text: "Looking great!" },
      { user: "Guest", text: "First time here, love it!" },
      { user: "Viewer", text: "👏👏👏" },
      { user: "HairLover", text: "Where can I buy?" },
      { user: "Fan", text: "Love from Ghana! 🇬🇭" },
    ];
    const commentInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        const c = simComments[Math.floor(Math.random() * simComments.length)];
        setComments((prev) => [...prev, { id: `sim_${Date.now()}`, user: c.user, text: c.text }]);
      }
    }, 3500 + Math.random() * 2500);

    return () => {
      clearInterval(interval);
      clearInterval(commentInterval);
      clearInterval(giftersInterval);
      clearInterval(pulseInterval);
      incrementStreamViewers(streamId, -1);
    };
  }, []);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.scrollTop = commentRef.current.scrollHeight;
    }
  }, [comments]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getWallet(currentUser.username).then((w) => {
      if (!active) return;
      setCoinBalance(w.coinBalance);
    });
    return () => { active = false; };
  }, [currentUser]);

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [...prev, {
      id: `me_${Date.now()}`,
      user: currentUser?.name || "You",
      avatar: currentUser?.avatar,
      text,
    }]);
    setCommentText("");
  };

  const handleGift = (gift: typeof giftTiers[0]) => {
    if (!currentUser) {
      showToast("Sign in to send gifts");
      return;
    }
    const tierIndex = giftTiers.findIndex((t) => t.name === gift.name);
    if (tierIndex === -1) return;

    sendGift(currentUser.username, stream.hostUsername, tierIndex).then((res) => {
      if (res.success && res.senderWallet) {
        setCoinBalance(res.senderWallet.coinBalance);

        const id = ++giftIdRef.current;
        setFloatingGifts((prev) => [...prev, { id, icon: gift.icon }]);
        setTimeout(() => setFloatingGifts((prev) => prev.filter((g) => g.id !== id)), 3000);
        setGiftBurst({ icon: gift.icon, name: gift.name, cost: gift.cost, nonce: Date.now() });
        setTimeout(() => setGiftBurst((cur) => (cur && Date.now() - cur.nonce >= 2100 ? null : cur)), 2200);

        const now = Date.now();
        const current = giftComboRef.current;
        if (current && current.icon === gift.icon && now - current.nonce < 2000) {
          const newCount = current.count + 1;
          giftComboRef.current = { ...current, count: newCount, nonce: now };
          setGiftCombo({ ...current, count: newCount, nonce: now });
        } else {
          giftComboRef.current = { icon: gift.icon, name: gift.name, count: 1, nonce: now };
          setGiftCombo({ icon: gift.icon, name: gift.name, count: 1, nonce: now });
        }
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => {
          setGiftCombo(null);
          giftComboRef.current = null;
        }, 2200);

        setComments((prev) => [...prev, {
          id: `gift_${Date.now()}`,
          user: currentUser?.name || "You",
          avatar: currentUser?.avatar,
          text: `sent a ${gift.name}!`,
          isGift: true,
          giftIcon: gift.icon,
        }]);
        setShowGifts(false);
        showToast(`${gift.icon} ${gift.name} sent! -${gift.cost} coins`);
      } else {
        showToast(res.error || "Not enough coins");
      }
    });
  };

  const handleLike = () => {
    setLikes((n) => n + 1);
    const now = Date.now();
    const burst = Array.from({ length: 5 }, () => ({
      id: ++heartIdRef.current + now,
      left: 10 + Math.random() * 60,
      size: 18 + Math.random() * 14,
    }));
    setFloatingHearts((prev) => [...prev.slice(-30), ...burst]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !burst.some((b) => b.id === h.id)));
    }, 2000);
  };

  const handleVote = (optionId: string) => {
    setPoll((cur) => {
      if (cur.voted) return cur;
      return {
        ...cur,
        voted: optionId,
        options: cur.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
      };
    });
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/live?watch=${stream.id}` : "/live";
    if (navigator.share) {
      try {
        await navigator.share({ title: `${stream.hostName} is LIVE`, text: `Watch ${stream.hostName} live on VOXel!`, url: shareUrl });
      } catch {}
    } else {
      try { await navigator.clipboard.writeText(shareUrl); } catch {}
      showToast("Stream link copied!");
    }
  };

  const handleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      showToast(next ? `Following ${stream.hostName}!` : `Unfollowed`);
      return next;
    });
  };

  const handleBuy = () => {
    if (!buyProduct) return;
    markProductSold(buyProduct.id);
    setProducts(getLiveProducts(streamIdRef.current));
    showToast(`Purchased ${buyProduct.name}! 🎉`);
    setBuyProduct(null);
  };

  const handleBid = (amount: number): boolean => {
    if (!bidAuction) return false;
    const result = placeBid(bidAuction.id, currentUser?.name || "You", amount);
    if (result.success) {
      setAuctions(getLiveAuctions(streamIdRef.current));
      showToast(`Bid placed: ${formatPrice(amount, bidAuction.currency)}! 🔨`);
      setBidAuction(null);
      return true;
    }
    return false;
  };

  const elapsed = Math.floor((Date.now() - stream.startedAt) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black flex flex-col"
    >
      <div className="relative flex-1 bg-gradient-to-br from-vox-bg via-black to-vox-bg flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-vox-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-vox-pink/15 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-1 animate-pulse">
            <div className="w-full h-full rounded-full bg-vox-bg overflow-hidden flex items-center justify-center">
              {stream.hostAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stream.hostAvatar} alt={stream.hostName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Radio className="w-10 h-10 text-vox-pink" />
              )}
            </div>
          </div>
          <p className="text-white font-bold text-lg">{stream.hostName}</p>
          <p className="text-vox-muted text-sm">{stream.title}</p>
        </div>

        {/* Floating gifts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {floatingGifts.map((g) => (
              <motion.div
                key={g.id}
                initial={{ y: "100%", x: "50%", opacity: 0, scale: 0.5 }}
                animate={{ y: "0%", x: "50%", opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 3 }}
                className="absolute left-1/2 bottom-20 text-5xl"
              >
                {g.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating hearts (TikTok-style) */}
        <div className="absolute right-2 bottom-28 w-24 h-80 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.span
                key={h.id}
                initial={{ y: 0, opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ y: -300, opacity: [0, 1, 1, 0], scale: 1.2, rotate: 8, x: [0, -14, 12, -6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute bottom-0 text-vox-pink drop-shadow-lg"
                style={{ left: `${h.left}%`, fontSize: h.size }}
              >
                ❤️
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Gift burst */}
        <AnimatePresence>
          {giftBurst && (
            <motion.div
              key={giftBurst.nonce}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              className="absolute left-1/2 top-[38%] -translate-x-1/2 z-30 pointer-events-none"
            >
              <div className="glass-strong rounded-3xl px-8 py-5 text-center border border-white/15 shadow-2xl shadow-vox-purple/30">
                <motion.div
                  initial={{ rotate: -20, scale: 0.7 }}
                  animate={{ rotate: [0, 12, 0], scale: [0.7, 1.3, 1] }}
                  transition={{ duration: 0.9 }}
                  className="text-6xl"
                >
                  {giftBurst.icon}
                </motion.div>
                <p className="text-white font-bold mt-1.5">{giftBurst.name}</p>
                <p className="text-xs text-vox-orange mt-0.5">+{giftBurst.cost} coins</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gift combo indicator */}
        <AnimatePresence>
          {giftCombo && giftCombo.count > 1 && (
            <motion.div
              key={giftCombo.nonce}
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.3, repeat: giftCombo.count > 1 ? Infinity : 0 }}
                className="glass-strong rounded-2xl px-4 py-3 flex flex-col items-center border border-vox-orange/30 shadow-2xl shadow-vox-orange/20"
              >
                <span className="text-4xl">{giftCombo.icon}</span>
                <motion.span
                  key={giftCombo.count}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-vox-orange mt-1"
                >
                  x{giftCombo.count}
                </motion.span>
                <span className="text-[9px] text-vox-muted">COMBO!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20" style={{ paddingTop: "calc(var(--safe-top, 0px) + 12px)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center touch-feedback border border-white/10">
                <X className="w-5 h-5 text-white" />
              </button>
              {/* Host profile card */}
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-1.5 pr-3 py-1 border border-white/10">
                {stream.hostAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stream.hostAvatar} alt={stream.hostName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">{stream.hostName}</span>
                  <button
                    onClick={handleFollow}
                    className={`text-[9px] font-bold leading-tight ${isFollowing ? "text-vox-muted" : "text-vox-pink"}`}
                  >
                    {isFollowing ? "Following" : "Follow +"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-vox-danger/90 backdrop-blur-md rounded-full px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
              <motion.div
                animate={viewerPulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10"
              >
                <Eye className="w-3 h-3 text-white/80" />
                <span className="text-xs font-medium text-white">{formatCountShort(viewers)}</span>
              </motion.div>
              <div className="text-xs text-white/60 font-medium bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                {formatDuration(elapsed)}
              </div>
            </div>
          </div>
        </div>

        {/* Shopping/Auction tabs */}
        {(products.length > 0 || auctions.length > 0) && (
          <div className="absolute top-16 left-3 right-3 z-20 flex gap-2">
            {products.length > 0 && (
              <button
                onClick={() => { setShowShopping(!showShopping); setShowAuctions(false); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold touch-feedback border ${
                  showShopping ? "bg-vox-purple/80 text-white border-vox-purple" : "bg-black/40 text-white/80 border-white/10 backdrop-blur-md"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Shop ({products.filter(p => !p.sold).length})
              </button>
            )}
            {auctions.length > 0 && (
              <button
                onClick={() => { setShowAuctions(!showAuctions); setShowShopping(false); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold touch-feedback border ${
                  showAuctions ? "bg-vox-orange/80 text-white border-vox-orange" : "bg-black/40 text-white/80 border-white/10 backdrop-blur-md"
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                Auctions ({auctions.length})
              </button>
            )}
          </div>
        )}

        {/* Shopping panel */}
        <AnimatePresence>
          {showShopping && products.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute top-28 left-3 right-3 z-30 glass-strong rounded-2xl p-3 max-h-[45%] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-vox-purple" /> Live Shopping
                </span>
                <button onClick={() => setShowShopping(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center">
                  <X className="w-3 h-3 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className={`flex items-center gap-3 glass rounded-xl p-2.5 ${p.sold ? "opacity-50" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <p className="text-xs text-vox-muted truncate">{p.description}</p>
                      <p className="text-sm font-bold text-vox-pink mt-0.5">{formatPrice(p.price, p.currency)}</p>
                    </div>
                    {p.sold ? (
                      <span className="text-xs font-bold text-vox-muted flex items-center gap-1">
                        <Check className="w-3 h-3" /> Sold
                      </span>
                    ) : (
                      <button
                        onClick={() => { setBuyProduct(p); setShowShopping(false); }}
                        className="btn-gradient rounded-full px-3 py-1.5 text-xs font-bold text-white touch-feedback flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Buy
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auctions panel */}
        <AnimatePresence>
          {showAuctions && auctions.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute top-28 left-3 right-3 z-30 glass-strong rounded-2xl p-3 max-h-[45%] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-vox-orange" /> Live Auctions
                </span>
                <button onClick={() => setShowAuctions(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center">
                  <X className="w-3 h-3 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2">
                {auctions.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 glass rounded-xl p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.itemName} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{a.itemName}</p>
                      <p className="text-xs text-vox-muted">{a.bids} bids · {formatCountdown(a.endsAt - Date.now())}</p>
                      <p className="text-sm font-bold text-vox-orange mt-0.5">{formatPrice(a.currentBid, a.currency)}</p>
                    </div>
                    <button
                      onClick={() => { setBidAuction(a); setShowAuctions(false); }}
                      className="bg-gradient-to-r from-vox-orange to-vox-pink rounded-full px-3 py-1.5 text-xs font-bold text-white touch-feedback flex items-center gap-1"
                    >
                      <Gavel className="w-3 h-3" /> Bid
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments overlay */}
        <div
          ref={commentRef}
          className="absolute bottom-24 left-3 right-16 z-20 max-h-[40%] overflow-y-auto scrollbar-hide space-y-1.5"
        >
          {/* Pinned comment */}
          <div className="flex items-start gap-2 sticky top-0 z-10">
            <div className="flex items-start gap-1.5 bg-vox-purple/40 backdrop-blur-md rounded-2xl px-2.5 py-1.5 max-w-[92%] border border-vox-purple/40">
              <span className="text-xs shrink-0">📌</span>
              <div>
                <span className="text-[9px] font-bold text-vox-pink block">PINNED</span>
                <span className="text-xs text-white break-words">Welcome to the LIVE! Follow, share and keep it positive 💜</span>
              </div>
            </div>
          </div>
          {comments.slice(-30).map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 max-w-[85%]">
                {c.isGift ? (
                  <span className="text-lg">{c.giftIcon}</span>
                ) : (
                  <span className="text-xs font-bold text-vox-cyan shrink-0">{c.user}:</span>
                )}
                <span className="text-xs text-white break-words">{c.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right-side action buttons */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3">
          <button onClick={handleFollow} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border ${isFollowing ? "bg-vox-purple/80 border-vox-purple" : "bg-black/30 border-white/10"}`}>
              <Users className={`w-5 h-5 ${isFollowing ? "text-white" : "text-white"}`} />
            </div>
            <span className="text-[9px] font-medium text-white/80">{isFollowing ? "Following" : "Follow"}</span>
          </button>
          <button onClick={handleLike} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className="w-11 h-11 rounded-full bg-vox-danger/80 backdrop-blur-md flex items-center justify-center border border-vox-danger/50">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-[9px] font-medium text-white/80">{formatCountShort(likes)}</span>
          </button>
          <button onClick={() => setShowPoll(!showPoll)} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border ${showPoll ? "bg-vox-cyan/60 border-vox-cyan" : "bg-black/30 border-white/10"}`}>
              <span className="text-lg">📊</span>
            </div>
            <span className="text-[9px] font-medium text-white/80">Poll</span>
          </button>
          <button onClick={() => setShowGifts(!showGifts)} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Gift className="w-5 h-5 text-white" />
            </div>
          </button>
          <button onClick={() => setShowTopGifters(!showTopGifters)} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border ${showTopGifters ? "bg-vox-orange/60 border-vox-orange" : "bg-black/30 border-white/10"}`}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] font-medium text-white/80">Top</span>
          </button>
          <button onClick={handleShare} className="touch-feedback flex flex-col items-center gap-0.5">
            <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Share2 className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>

        {/* Top gifters overlay */}
        <AnimatePresence>
          {showTopGifters && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              className="absolute top-28 right-3 z-30 glass-strong rounded-2xl p-4 border border-white/10 w-48"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold tracking-widest text-vox-orange">TOP GIFTERS</span>
                <button onClick={() => setShowTopGifters(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center">
                  <X className="w-3 h-3 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2">
                {topGifters.map((gifter, idx) => (
                  <div key={gifter.name} className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${idx === 0 ? "text-vox-orange" : idx === 1 ? "text-vox-purple" : idx === 2 ? "text-vox-pink" : "text-vox-muted"}`}>
                      #{idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center text-xs font-bold text-white">
                      {gifter.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{gifter.name}</p>
                      <p className="text-[9px] text-vox-orange">{formatCountShort(gifter.coins)} coins</p>
                    </div>
                    <span className="text-base">{gifter.icon}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poll overlay */}
        <AnimatePresence>
          {showPoll && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              className="absolute top-28 left-3 right-16 z-30 glass-strong rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-vox-purple">LIVE POLL</span>
                  <h3 className="text-sm font-bold text-white mt-1">{poll.question}</h3>
                </div>
                <button onClick={() => setShowPoll(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center shrink-0">
                  <X className="w-3 h-3 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {poll.options.map((o) => {
                  const total = poll.options.reduce((s, x) => s + x.votes, 0);
                  const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
                  return (
                    <button
                      key={o.id}
                      onClick={() => handleVote(o.id)}
                      disabled={!!poll.voted}
                      className="relative w-full overflow-hidden rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2.5 flex items-center justify-between touch-feedback disabled:cursor-default"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`absolute inset-y-0 left-0 ${poll.voted === o.id ? "bg-gradient-to-r from-vox-purple/50 to-vox-pink/30" : "bg-white/[0.06]"}`}
                      />
                      <span className="relative z-10 text-xs text-white font-medium flex items-center gap-1.5">
                        {o.label}
                        {poll.voted === o.id && <Check className="w-3 h-3 text-vox-green" />}
                      </span>
                      <span className="relative z-10 text-xs font-bold text-white/80">{pct}%</span>
                    </button>
                  );
                })}
              </div>
              {poll.voted && <p className="text-[10px] text-vox-muted mt-2">Thanks for voting!</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gift panel */}
        <AnimatePresence>
          {showGifts && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-16 left-3 right-3 z-30 glass-strong rounded-2xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Send a Gift</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-vox-orange font-medium">{coinBalance.toLocaleString()} coins</span>
                  <button onClick={() => setShowGifts(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center">
                    <X className="w-3 h-3 text-vox-muted" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {giftTiers.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => handleGift(g)}
                    className="glass rounded-xl p-2.5 flex flex-col items-center gap-1 touch-feedback hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-[10px] text-white font-medium">{g.name}</span>
                    <span className="text-[9px] text-vox-orange">{g.cost} coins</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment input */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Say something..."
            className="flex-1 bg-black/40 backdrop-blur-md text-white text-sm rounded-full px-4 py-2.5 outline-none border border-white/10 placeholder:text-white/40"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim()}
            className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center touch-feedback disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-20 left-1/2 z-[90] glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Now modal */}
      <AnimatePresence>
        {buyProduct && <BuyNowModal product={buyProduct} onClose={() => setBuyProduct(null)} onBuy={handleBuy} />}
      </AnimatePresence>

      {/* Bid modal */}
      <AnimatePresence>
        {bidAuction && <BidModal auction={bidAuction} onClose={() => setBidAuction(null)} onBid={handleBid} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────── GO LIVE (HOST) ─────────────────────────── */

function LiveHost({ stream, initialStream, onEnd }: { stream: LiveStream; initialStream?: MediaStream | null; onEnd: () => void }) {
  const { currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(initialStream || null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [viewers, setViewers] = useState(1);
  const [peakViewers, setPeakViewers] = useState(1);
  const [likes, setLikes] = useState(0);
  const [giftsReceived, setGiftsReceived] = useState<{ icon: string; name: string; count: number }[]>([]);
  const [totalGiftCoins, setTotalGiftCoins] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showStreamSummary, setShowStreamSummary] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(!initialStream);
  const [isSavingStream, setIsSavingStream] = useState(false);
  const [streamSaved, setStreamSaved] = useState(false);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [recordingBlobUrl, setRecordingBlobUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [beautyFilter, setBeautyFilter] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; size: number }[]>([]);
  const [giftBurst, setGiftBurst] = useState<{ icon: string; name: string; cost: number; nonce: number } | null>(null);
  const [viewerPulse, setViewerPulse] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const streamIdRef = useRef(stream.id);
  const didInitRef = useRef(false);
  const heartIdRef = useRef(0);
  const startTimeRef = useRef(stream.startedAt);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setCameraStarting(true);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available. Please use a modern browser over HTTPS.");
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setError(null);
    } catch (err) {
      console.error("Camera access failed:", err);
      setError("Camera access denied. Please allow camera permissions to go live.");
    } finally {
      setCameraStarting(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (initialStream) {
        if (videoRef.current) {
          videoRef.current.srcObject = initialStream;
          videoRef.current.play().catch(() => {});
        }
        setCameraStarting(false);
      } else {
        startCamera();
      }
    } else {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [initialStream, startCamera]);

  // Ensure video plays whenever camera becomes ready (mobile autoplay fix)
  useEffect(() => {
    if (!cameraStarting && !error && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStarting, error]);

  // Start recording when the camera stream is ready
  useEffect(() => {
    if (cameraStarting || error || !streamRef.current) return;

    // Only reset chunks on the very first recording start
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "";

      const recorder = new MediaRecorder(
        streamRef.current,
        mimeType ? { mimeType } : undefined,
      );
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.warn("MediaRecorder not available:", err);
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };
  }, [cameraStarting, error]);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const toggleBeautyFilter = () => {
    setBeautyFilter((prev) => !prev);
  };

  // Viewer count + stats polling
  useEffect(() => {
    const streamId = streamIdRef.current;
    const interval = setInterval(() => {
      const s = getStreamById(streamId);
      if (s) {
        setViewers((prev) => {
          if (s.viewers > prev) setViewerPulse(true);
          if (s.viewers > peakViewers) setPeakViewers(s.viewers);
          return s.viewers;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [peakViewers]);

  // Reset viewer pulse
  useEffect(() => {
    if (viewerPulse) {
      const t = setTimeout(() => setViewerPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [viewerPulse]);

  // Simulated comments + hearts + gifts
  useEffect(() => {
    const simComments = [
      { user: "AmaFan123", text: "You look amazing! 🔥" },
      { user: "EsiLovesHair", text: "Love from Kumasi! 🇬🇭" },
      { user: "GlowSeeker", text: "How much for the frontal?" },
      { user: "NaturalQueen", text: "Drop the link!! 🙌" },
      { user: "Viewer", text: "Hey! Great stream 🔥" },
      { user: "Fan", text: "You look amazing!" },
      { user: "Guest", text: "First time here 👋" },
      { user: "HairLover", text: "Where can I buy?" },
      { user: "Fan", text: "👏👏👏" },
      { user: "Viewer", text: "Love from Ghana! 🇬🇭" },
      { user: "BeautyQueen", text: "Your content is fire! 💯" },
      { user: "Adwoa", text: "Following you now!" },
    ];
    const commentInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        const c = simComments[Math.floor(Math.random() * simComments.length)];
        setComments((prev) => [...prev, { id: `sim_${Date.now()}`, user: c.user, text: c.text }]);
      }
    }, 4000 + Math.random() * 3000);

    // Simulated likes
    const likeInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const burst = Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => ({
          id: ++heartIdRef.current + Date.now(),
          left: 10 + Math.random() * 70,
          size: 16 + Math.random() * 14,
        }));
        setFloatingHearts((prev) => [...prev.slice(-30), ...burst]);
        setLikes((n) => n + burst.length);
        setTimeout(() => {
          setFloatingHearts((prev) => prev.filter((h) => !burst.some((b) => b.id === h.id)));
        }, 2500);
      }
    }, 5000 + Math.random() * 4000);

    // Simulated gifts
    const giftInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const gift = giftTiers[Math.floor(Math.random() * giftTiers.length)];
        setGiftBurst({ icon: gift.icon, name: gift.name, cost: gift.cost, nonce: Date.now() });
        setTimeout(() => setGiftBurst((cur) => (cur && Date.now() - cur.nonce >= 2100 ? null : cur)), 2200);
        setTotalGiftCoins((n) => n + gift.cost);
        setGiftsReceived((prev) => {
          const existing = prev.find((g) => g.icon === gift.icon);
          if (existing) {
            return prev.map((g) => (g.icon === gift.icon ? { ...g, count: g.count + 1 } : g));
          }
          return [...prev, { icon: gift.icon, name: gift.name, count: 1 }];
        });
        setComments((prev) => [...prev, {
          id: `gift_${Date.now()}`,
          user: "Viewer",
          text: `sent a ${gift.name}!`,
          isGift: true,
          giftIcon: gift.icon,
        }]);
      }
    }, 8000 + Math.random() * 6000);

    return () => {
      clearInterval(commentInterval);
      clearInterval(likeInterval);
      clearInterval(giftInterval);
    };
  }, []);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.scrollTop = commentRef.current.scrollHeight;
    }
  }, [comments]);

  const handleEndStream = () => {
    // Stop recording and create blob URL
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const recordedType = recorder.mimeType || "video/webm";
          const blob = new Blob(recordedChunksRef.current, { type: recordedType });
          const url = URL.createObjectURL(blob);
          setRecordingBlobUrl(url);
          setRecordingAvailable(true);
        }
      };
      recorder.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    endLiveStream(streamIdRef.current);
    setShowEndConfirm(false);
    setShowStreamSummary(true);
  };

  const handleFinishSummary = () => {
    if (recordingBlobUrl) URL.revokeObjectURL(recordingBlobUrl);
    setShowStreamSummary(false);
    onEnd();
  };

  const handleDownloadRecording = () => {
    if (!recordingBlobUrl) return;
    const ext = mediaRecorderRef.current?.mimeType?.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = recordingBlobUrl;
    a.download = `voxel_live_${stream.title.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveStreamToFeed = async () => {
    if (!currentUser || !recordingBlobUrl || isSavingStream || streamSaved) return;
    setIsSavingStream(true);
    try {
      const blob = await fetch(recordingBlobUrl).then((r) => r.blob());
      const { url, id } = await uploadFile(blob, `livestream_${stream.id}`);
      await createPost({
        authorUsername: currentUser.username,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar || "",
        caption: `Live stream: ${stream.title}`,
        hashtags: `live ${stream.category.replace(/\\s+/g, "")}`.trim(),
        type: "video",
        mediaUrls: [url],
        mediaIds: [id],
        privacy: "Public",
        allowDownload: true,
        allowComments: true,
        allowDuet: false,
      });
      setStreamSaved(true);
    } catch (err) {
      console.error("Failed to save stream:", err);
    } finally {
      setIsSavingStream(false);
    }
  };

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [...prev, {
      id: `me_${Date.now()}`,
      user: currentUser?.name || "You",
      avatar: currentUser?.avatar,
      text,
    }]);
    setCommentText("");
  };

  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black flex flex-col"
    >
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <VideoOff className="w-16 h-16 text-vox-muted" />
            <p className="text-white text-center text-sm">{error}</p>
            <button onClick={startCamera} className="btn-gradient rounded-full px-5 py-2 text-sm font-semibold text-white touch-feedback">
              Try Again
            </button>
          </div>
        ) : cameraStarting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
            <p className="text-white/70 text-sm">Starting camera...</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              preload="auto"
              onLoadedMetadata={() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }}
              onCanPlay={() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
                filter: beautyFilter ? "brightness(1.08) contrast(1.05) saturate(1.15) blur(0.4px)" : "none",
                transition: "filter 0.3s ease",
              }}
            />
            {beautyFilter && facingMode === "user" && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,200,200,0.04) 100%)",
              }} />
            )}
          </>
        )}

        {/* Floating hearts */}
        <div className="absolute right-2 bottom-28 w-24 h-80 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {floatingHearts.map((h) => (
              <motion.span
                key={h.id}
                initial={{ y: 0, opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ y: -300, opacity: [0, 1, 1, 0], scale: 1.2, rotate: 8, x: [0, -14, 12, -6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-0 text-vox-pink drop-shadow-lg"
                style={{ left: `${h.left}%`, fontSize: h.size }}
              >
                ❤️
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Gift burst */}
        <AnimatePresence>
          {giftBurst && (
            <motion.div
              key={giftBurst.nonce}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              className="absolute left-1/2 top-[35%] -translate-x-1/2 z-30 pointer-events-none"
            >
              <div className="glass-strong rounded-3xl px-8 py-5 text-center border border-white/15 shadow-2xl shadow-vox-purple/30">
                <motion.div
                  initial={{ rotate: -20, scale: 0.7 }}
                  animate={{ rotate: [0, 12, 0], scale: [0.7, 1.3, 1] }}
                  transition={{ duration: 0.9 }}
                  className="text-6xl"
                >
                  {giftBurst.icon}
                </motion.div>
                <p className="text-white font-bold mt-1.5">{giftBurst.name}</p>
                <p className="text-xs text-vox-orange mt-0.5">+{giftBurst.cost} coins</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20" style={{ paddingTop: "calc(var(--safe-top, 0px) + 12px)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-vox-danger/90 backdrop-blur-md rounded-full px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
              {isRecording && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-vox-danger animate-pulse" />
                  <span className="text-[10px] font-bold text-white/80">REC</span>
                </div>
              )}
              <motion.div
                animate={viewerPulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10"
              >
                <Eye className="w-3 h-3 text-white/80" />
                <span className="text-xs font-medium text-white">{formatCountShort(viewers)}</span>
              </motion.div>
              <div className="text-xs text-white/60 font-medium bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                {formatDuration(elapsed)}
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                <Heart className="w-3 h-3 text-vox-pink fill-vox-pink" />
                <span className="text-xs font-medium text-white">{formatCountShort(likes)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center touch-feedback border border-white/10"
              >
                <BarChart3 className={`w-4 h-4 ${showStats ? "text-vox-cyan" : "text-white"}`} />
              </button>
              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex items-center gap-1.5 bg-vox-danger/90 backdrop-blur-md rounded-full px-3 py-1.5 touch-feedback"
              >
                <Circle className="w-3 h-3 text-white fill-white" />
                <span className="text-xs font-bold text-white">End</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stream stats overlay */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-16 left-3 right-3 z-30 glass-strong rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest text-vox-cyan">STREAM STATS</span>
                <button onClick={() => setShowStats(false)} className="w-6 h-6 rounded-full glass flex items-center justify-center">
                  <X className="w-3 h-3 text-vox-muted" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <Eye className="w-5 h-5 text-vox-cyan mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{viewers}</p>
                  <p className="text-[10px] text-vox-muted">Current Viewers</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-vox-green mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{peakViewers}</p>
                  <p className="text-[10px] text-vox-muted">Peak Viewers</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Heart className="w-5 h-5 text-vox-pink mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{formatCountShort(likes)}</p>
                  <p className="text-[10px] text-vox-muted">Total Likes</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Gift className="w-5 h-5 text-vox-orange mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{formatCountShort(totalGiftCoins)}</p>
                  <p className="text-[10px] text-vox-muted">Gift Coins</p>
                </div>
              </div>
              {giftsReceived.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold text-vox-muted mb-2">GIFTS RECEIVED</p>
                  <div className="flex flex-wrap gap-2">
                    {giftsReceived.map((g) => (
                      <div key={g.icon} className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
                        <span className="text-base">{g.icon}</span>
                        <span className="text-[10px] text-white font-medium">{g.name}</span>
                        <span className="text-[10px] text-vox-orange font-bold">x{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stream title */}
        <div className="absolute top-16 left-3 right-3 z-20" style={{ display: showStats ? "none" : "block" }}>
          <div className="bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 max-w-[80%]">
            <p className="text-sm font-semibold text-white truncate">{stream.title}</p>
            <p className="text-xs text-vox-muted">{stream.category}</p>
          </div>
        </div>

        {/* Comments overlay */}
        <div
          ref={commentRef}
          className="absolute bottom-20 left-3 right-3 z-20 max-h-[35%] overflow-y-auto scrollbar-hide space-y-1.5"
        >
          {comments.slice(-20).map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 max-w-[85%]">
                {c.isGift ? (
                  <span className="text-lg">{c.giftIcon}</span>
                ) : (
                  <span className="text-xs font-bold text-vox-cyan shrink-0">{c.user}:</span>
                )}
                <span className="text-xs text-white break-words">{c.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Say something..."
            className="flex-1 bg-black/40 backdrop-blur-md text-white text-sm rounded-full px-4 py-2.5 outline-none border border-white/10 placeholder:text-white/40"
          />
          <button
            onClick={toggleBeautyFilter}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center touch-feedback border ${beautyFilter ? "bg-vox-pink/40 border-vox-pink" : "bg-black/40 border-white/10"}`}
          >
            <Smile className={`w-4 h-4 ${beautyFilter ? "text-vox-pink" : "text-white"}`} />
          </button>
          <button onClick={toggleCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center touch-feedback border border-white/10">
            {cameraOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-vox-danger" />}
          </button>
          <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center touch-feedback border border-white/10">
            {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-vox-danger" />}
          </button>
          <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center touch-feedback border border-white/10">
            <FlipHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* End stream confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEndConfirm(false)}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl w-full max-w-xs p-5 space-y-4"
            >
              <h3 className="text-lg font-bold text-white text-center">End Stream?</h3>
              <p className="text-sm text-vox-muted text-center">Your live stream will end and viewers will be disconnected.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowEndConfirm(false)} className="flex-1 glass rounded-2xl py-3 text-sm font-bold text-vox-muted touch-feedback">
                  Cancel
                </button>
                <button onClick={handleEndStream} className="flex-1 bg-gradient-to-r from-vox-danger to-vox-pink rounded-2xl py-3 text-sm font-bold text-white touch-feedback">
                  End Stream
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stream summary */}
      <AnimatePresence>
        {showStreamSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="glass-strong rounded-3xl w-full max-w-sm p-6 space-y-5"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center mx-auto mb-3"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">Stream Ended</h3>
                <p className="text-sm text-vox-muted mt-1">Great stream! Here&rsquo;s your recap.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{formatDuration(elapsed)}</p>
                  <p className="text-[10px] text-vox-muted mt-1">Duration</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-vox-cyan">{peakViewers}</p>
                  <p className="text-[10px] text-vox-muted mt-1">Peak Viewers</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-vox-pink">{formatCountShort(likes)}</p>
                  <p className="text-[10px] text-vox-muted mt-1">Total Likes</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-vox-orange">{formatCountShort(totalGiftCoins)}</p>
                  <p className="text-[10px] text-vox-muted mt-1">Gift Coins</p>
                </div>
              </div>

              {giftsReceived.length > 0 && (
                <div className="glass rounded-2xl p-3">
                  <p className="text-[10px] font-bold text-vox-muted mb-2">GIFTS RECEIVED</p>
                  <div className="flex flex-wrap gap-2">
                    {giftsReceived.map((g) => (
                      <div key={g.icon} className="flex items-center gap-1 bg-white/[0.06] rounded-full px-2.5 py-1">
                        <span className="text-base">{g.icon}</span>
                        <span className="text-[10px] text-white font-medium">{g.name} x{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save stream recording */}
              {recordingAvailable && (
                <div className="space-y-2">
                  <div className="glass rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-vox-purple/20 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-vox-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Stream Recording Ready</p>
                      <p className="text-[10px] text-vox-muted">Save to your feed or download to device</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveStreamToFeed}
                      disabled={isSavingStream || streamSaved}
                      className="flex-1 bg-gradient-to-r from-vox-purple to-vox-pink rounded-2xl py-3 text-sm font-bold text-white touch-feedback disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingStream ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : streamSaved ? (
                        <><Check className="w-4 h-4" /> Saved to Feed</>
                      ) : (
                        "Save to Feed"
                      )}
                    </button>
                    <button
                      onClick={handleDownloadRecording}
                      className="glass rounded-2xl py-3 px-4 text-sm font-bold text-white touch-feedback flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleFinishSummary}
                className="w-full bg-gradient-to-r from-vox-purple to-vox-pink rounded-2xl py-3.5 text-sm font-bold text-white touch-feedback"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LivePage() {
  const router = useRouter();
  const { currentUser, hydrated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [hostStream, setHostStream] = useState<LiveStream | null>(null);
  const [hostMediaStream, setHostMediaStream] = useState<MediaStream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    seedLiveDemoData();
    const loadData = () => {
      setStreams(getActiveStreams());
      setProducts(getLiveProducts());
      setAuctions(getLiveAuctions());
    };
    loadData();
    // Deep link: /live?watch=<streamId> opens that stream directly
    if (typeof window !== "undefined") {
      const watchId = new URLSearchParams(window.location.search).get("watch");
      if (watchId) {
        const target = getStreamById(watchId);
        if (target && target.active) setActiveStream(target);
      }
    }
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [hydrated, currentUser, router]);

  const handleGoLive = (title: string, category: string, mediaStream: MediaStream | null) => {
    if (!currentUser) return;
    const stream = startLiveStream({
      hostUsername: currentUser.username,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar || "",
      title,
      category,
    });
    setHostMediaStream(mediaStream);
    setHostStream(stream);
    setShowGoLiveModal(false);
    const followsByUser = typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("voxel_follows_by_user") || "{}")
      : {};
    for (const u in followsByUser) {
      if (followsByUser[u].includes(currentUser.username)) {
        addNotification(u, {
          type: "live",
          fromUsername: currentUser.username,
          fromName: currentUser.name,
          fromAvatar: currentUser.avatar || "",
          message: "is now live!",
          detail: title,
        });
      }
    }
  };

  const handleEndStream = () => {
    setHostStream(null);
    setHostMediaStream(null);
    setStreams(getActiveStreams());
  };

  const featuredStream = streams[0] || null;
  const filteredStreams = activeCategory === "All"
    ? streams
    : streams.filter((s) => s.category === activeCategory);
  const searchedStreams = searchQuery.trim()
    ? filteredStreams.filter((s) =>
        s.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredStreams;
  const trendingStreamers = [...streams].sort((a, b) => b.viewers - a.viewers).slice(0, 5);

  if (!hydrated || !currentUser) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  if (hostStream) {
    return <LiveHost stream={hostStream} initialStream={hostMediaStream} onEnd={handleEndStream} />;
  }

  if (activeStream) {
    return <StreamViewer stream={activeStream} onClose={() => setActiveStream(null)} />;
  }

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-16 lg:pb-0">
      {/* ═══════ HEADER ═══════ */}
      <div
        className="sticky top-0 z-50 glass-strong backdrop-blur-xl px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vox-danger to-vox-pink flex items-center justify-center">
            <Radio className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">Live</h1>
          {streams.length > 0 && (
            <span className="text-[10px] font-bold bg-vox-danger text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
              {streams.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowGoLiveModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-vox-danger to-vox-pink rounded-full px-3 py-1.5 touch-feedback"
        >
          <Radio className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white">Go Live</span>
        </button>
      </div>

      {/* ═══════ GO LIVE BANNER ═══════ */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vox-purple/20 via-vox-pink/10 to-vox-orange/10 border border-white/[0.06] p-5"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-vox-danger/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-vox-danger" />
              <h2 className="text-base font-bold text-white">Go LIVE. Earn Together.</h2>
            </div>
            <p className="text-xs text-vox-muted mb-3">Stream, sell, auction, and earn with your community in real time.</p>
            <button
              onClick={() => setShowGoLiveModal(true)}
              className="bg-gradient-to-r from-vox-danger to-vox-pink rounded-full px-5 py-2 text-sm font-bold text-white touch-feedback flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Streaming
            </button>
          </div>
        </motion.div>
      </div>

      {/* ═══════ SEARCH BAR ═══════ */}
      <div className="px-4 pt-4 max-w-3xl mx-auto w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search streams, hosts, categories..."
            className="w-full glass rounded-full pl-11 pr-4 py-2.5 text-sm text-white outline-none border border-white/10 placeholder:text-vox-muted focus:border-vox-purple/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass flex items-center justify-center"
            >
              <X className="w-3 h-3 text-vox-muted" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════ TRENDING STREAMERS ═══════ */}
      {trendingStreamers.length > 0 && !searchQuery && (
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-vox-green" /> Trending Streamers
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {trendingStreamers.map((streamer, idx) => (
              <motion.button
                key={streamer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setActiveStream(streamer)}
                className="shrink-0 flex flex-col items-center gap-1.5 touch-feedback"
              >
                <div className="relative">
                  {streamer.hostAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={streamer.hostAvatar} alt={streamer.hostName} className="w-16 h-16 rounded-full object-cover ring-2 ring-vox-danger/50" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center ring-2 ring-vox-danger/50">
                      <Radio className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-vox-danger rounded-full px-1.5 py-0.5 border-2 border-vox-bg">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-vox-bg ${
                      idx === 0 ? "bg-vox-orange" : idx === 1 ? "bg-vox-purple" : "bg-vox-pink"
                    }`}>
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-white max-w-[64px] truncate">{streamer.hostName}</span>
                <span className="text-[9px] text-vox-muted flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> {formatCountShort(streamer.viewers)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ FEATURED LIVE ═══════ */}
      {featuredStream && (
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-vox-orange" /> Featured Live
            </h2>
            <button className="text-xs text-vox-muted">See all</button>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setActiveStream(featuredStream)}
            className="relative w-full aspect-video rounded-2xl overflow-hidden touch-feedback group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-vox-purple/30 to-vox-pink/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              {featuredStream.hostAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredStream.hostAvatar} alt={featuredStream.hostName} className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-vox-bg/50 flex items-center justify-center">
                  <Radio className="w-10 h-10 text-white/60" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-vox-danger rounded-full px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              <span className="text-[10px] font-bold text-white">LIVE</span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Eye className="w-3 h-3 text-white/80" />
              <span className="text-[10px] font-medium text-white">{formatCountShort(featuredStream.viewers)} watching</span>
            </div>

            {/* Floating gift indicators */}
            <div className="absolute top-12 right-3 flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-sm">💎</span>
                <span className="text-[10px] font-bold text-white">x3</span>
              </div>
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-sm">🔥</span>
                <span className="text-[10px] font-bold text-white">x7</span>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 mb-1">
                {featuredStream.hostAvatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredStream.hostAvatar} alt={featuredStream.hostName} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
                )}
                <p className="text-sm font-bold text-white">{featuredStream.hostName}</p>
                <span className="text-[10px] text-vox-muted bg-white/10 rounded-full px-2 py-0.5">{featuredStream.category}</span>
              </div>
              <p className="text-xs text-white/70 truncate">{featuredStream.title}</p>
            </div>
          </motion.button>
        </div>
      )}

      {/* ═══════ CATEGORIES ═══════ */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full touch-feedback whitespace-nowrap transition-all ${
                activeCategory === cat.label ? "glass text-white" : "text-vox-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ LIVE NOW ═══════ */}
      <div className="px-4 pt-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-vox-danger" /> Live Now
          </h2>
          {streams.length > 0 && <span className="text-xs text-vox-muted">{streams.length} streams</span>}
        </div>

          {searchedStreams.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              <Search className="w-12 h-12 text-vox-muted mx-auto mb-3" />
              <p className="text-white font-semibold">{searchQuery ? "No streams found" : "No live streams right now"}</p>
              <p className="text-vox-muted text-sm mt-1 mb-4">{searchQuery ? "Try a different search" : "Be the first to go live!"}</p>
              {!searchQuery && (
                <button
                  onClick={() => setShowGoLiveModal(true)}
                  className="bg-gradient-to-r from-vox-danger to-vox-pink rounded-full px-5 py-2 text-sm font-bold text-white touch-feedback"
                >
                  Go Live
                </button>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {searchedStreams.map((stream) => (
              <motion.button
                key={stream.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setActiveStream(stream)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden touch-feedback card-hover group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-vox-purple/30 to-vox-pink/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {stream.hostAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stream.hostAvatar} alt={stream.hostName} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-vox-bg/50 flex items-center justify-center">
                      <Radio className="w-8 h-8 text-white/60" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-2 left-2 flex items-center gap-1 bg-vox-danger rounded-full px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  <span className="text-[9px] font-bold text-white">LIVE</span>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Eye className="w-2.5 h-2.5 text-white/80" />
                  <span className="text-[9px] font-medium text-white">{formatCountShort(stream.viewers)}</span>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-semibold text-white truncate">{stream.hostName}</p>
                  <p className="text-[10px] text-white/70 truncate">{stream.title}</p>
                  <p className="text-[9px] text-vox-muted mt-0.5">{stream.category}</p>
                </div>
              </motion.button>
            ))}
          </div>
          )}
      </div>

      {/* ═══════ LIVE SHOPPING ═══════ */}
      {products.filter(p => !p.sold).length > 0 && (
        <div className="px-4 pt-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-vox-purple" /> Live Shopping
            </h2>
            <button className="text-xs text-vox-muted">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {products.filter(p => !p.sold).map((p) => {
              const stream = streams.find(s => s.id === p.streamId);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="shrink-0 w-40 glass rounded-2xl overflow-hidden touch-feedback card-hover"
                  onClick={() => stream && setActiveStream(stream)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-vox-danger rounded-full px-2 py-0.5">
                      <span className="text-[8px] font-bold text-white">LIVE</span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-vox-muted truncate">by {stream?.hostName || "Unknown"}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-vox-pink">{formatPrice(p.price, p.currency)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (stream) setActiveStream(stream); }}
                      className="w-full mt-2 btn-gradient rounded-full py-1.5 text-[10px] font-bold text-white touch-feedback flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" /> Buy Now
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ LIVE AUCTIONS ═══════ */}
      {auctions.length > 0 && (
        <div className="px-4 pt-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-vox-orange" /> Live Auctions
            </h2>
            <button className="text-xs text-vox-muted">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {auctions.map((a) => {
              const stream = streams.find(s => s.id === a.streamId);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="shrink-0 w-44 glass rounded-2xl overflow-hidden touch-feedback card-hover"
                  onClick={() => stream && setActiveStream(stream)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt={a.itemName} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-vox-orange rounded-full px-2 py-0.5">
                      <span className="text-[8px] font-bold text-white">{formatCountdown(a.endsAt - Date.now())}</span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-white truncate">{a.itemName}</p>
                    <p className="text-[10px] text-vox-muted truncate">by {stream?.hostName || "Unknown"}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <p className="text-[9px] text-vox-muted">Current Bid</p>
                        <p className="text-sm font-bold text-vox-orange">{formatPrice(a.currentBid, a.currency)}</p>
                      </div>
                      <span className="text-[9px] text-vox-muted">{a.bids} bids</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (stream) setActiveStream(stream); }}
                      className="w-full mt-2 bg-gradient-to-r from-vox-orange to-vox-pink rounded-full py-1.5 text-[10px] font-bold text-white touch-feedback flex items-center justify-center gap-1"
                    >
                      <Gavel className="w-3 h-3" /> Place Bid
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ GIFT TIERS ═══════ */}
      <div className="px-4 pt-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-vox-pink" /> Gift Tiers
          </h2>
          <button className="text-xs text-vox-muted">See all</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {giftTiers.map((g) => (
            <div
              key={g.name}
              className="glass rounded-2xl p-3 flex flex-col items-center gap-1"
            >
              <span className="text-3xl">{g.icon}</span>
              <span className="text-xs text-white font-medium">{g.name}</span>
              <span className="text-[10px] text-vox-orange">{g.cost} coins</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ GO LIVE MODAL ═══════ */}
      <AnimatePresence>
        {showGoLiveModal && (
          <GoLiveModal onClose={() => setShowGoLiveModal(false)} onGoLive={handleGoLive} />
        )}
      </AnimatePresence>
    </div>
  );
}
