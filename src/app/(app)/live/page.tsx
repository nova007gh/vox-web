"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Eye,
  Heart,
  Gift,
  ShoppingBag,
  Gavel,
  BadgeCheck,
  Play,
  Pause,
  Star,
  Diamond,
  Send,
  Share,
  ShoppingCart,
} from "lucide-react";

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
];

const liveStreams = [
  { id: 1, name: "JUST WEAR WIGS", viewers: 12300, viewersLabel: "12.3K", category: "Beauty", avatar: "/profiles/justwearwigs/avatar.jpeg", thumbnail: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
  { id: 2, name: "Glow By Nana", viewers: 8700, viewersLabel: "8.7K", category: "Beauty", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", thumbnail: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
  { id: 3, name: "Berry Beauty", viewers: 3200, viewersLabel: "3.2K", category: "Beauty", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", thumbnail: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
  { id: 4, name: "Hair By Maame", viewers: 5100, viewersLabel: "5.1K", category: "Beauty", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", thumbnail: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
  { id: 5, name: "Wigs By Akua", viewers: 2800, viewersLabel: "2.8K", category: "Beauty", avatar: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", thumbnail: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
  { id: 6, name: "Afro Queen", viewers: 15400, viewersLabel: "15.4K", category: "Beauty", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", thumbnail: "https://images.unsplash.com/photo-1613730318129-bf0ca2a12364?fm=jpg&q=60&w=600&h=400&auto=format&fit=crop" },
];

const initialComments = [
  { user: "AmaFan123", text: "The wig is gorgeous! �‍♀️" },
  { user: "EsiLovesHair", text: "Love from Kumasi! Booking now" },
  { user: "GlowSeeker", text: "How much for the frontal? �" },
  { user: "NaturalQueen", text: "Drop the link!! 🙌" },
];

const liveProducts = [
  { id: 1, name: "Silk Press Straight", price: "GHS 4,200", productImage: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", seller: "JUST WEAR WIGS", viewers: 142 },
  { id: 2, name: "Ombre Color Masterpiece", price: "GHS 8,300", productImage: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", seller: "JUST WEAR WIGS", viewers: 89 },
  { id: 3, name: "Curly Goddess Curls", price: "GHS 2,500", productImage: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", seller: "JUST WEAR WIGS", viewers: 214 },
];

const initialAuctions = [
  { id: 1, name: "Ombre Color Masterpiece - Custom", currentBid: 8300, bids: 23, timeLeft: "2:34", seller: "JUST WEAR WIGS" },
  { id: 2, name: "Ocean Wave Goddess - Premium", currentBid: 8500, bids: 41, timeLeft: "5:12", seller: "JUST WEAR WIGS" },
];

const giftTiers = [
  { name: "Heart", icon: "❤️", cost: 50 },
  { name: "Rose", icon: "🌹", cost: 100 },
  { name: "Fire", icon: "🔥", cost: 200 },
  { name: "Diamond", icon: "💎", cost: 500 },
  { name: "Rocket", icon: "🚀", cost: 1000 },
  { name: "King", icon: "👑", cost: 5000 },
];

/* ─────────────────────────── SECTION HEADER ─────────────────────────── */

function SectionHeader({ icon: Icon, title, onSeeAll }: { icon?: React.ElementType; title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-vox-pink" />}
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
      </div>
      <button
        onClick={onSeeAll}
        className="text-xs text-vox-muted touch-feedback hover:text-white transition-colors"
      >
        See all
      </button>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LivePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [commentText, setCommentText] = useState("");
  const [liveComments, setLiveComments] = useState(initialComments);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [featuredStream, setFeaturedStream] = useState(liveStreams[1]);
  const [viewerCount, setViewerCount] = useState(8700);
  const [auctions, setAuctions] = useState(initialAuctions);
  const [biddingOn, setBiddingOn] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [cart, setCart] = useState<typeof liveProducts>([]);
  const [floatingGifts, setFloatingGifts] = useState<{ id: number; icon: string }[]>([]);
  const [joiningStream, setJoiningStream] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const giftIdRef = useRef(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Viewer count animation — random fluctuations every 3-5 seconds
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 3000 + Math.floor(Math.random() * 2000); // 3-5s
      timeout = setTimeout(() => {
        setViewerCount((prev) => {
          const delta = Math.floor(Math.random() * 10) + 1; // 1-10
          return Math.max(0, prev + (Math.random() > 0.5 ? delta : -delta));
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [featuredStream]);

  // Auto-scroll comments
  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.scrollTop = commentRef.current.scrollHeight;
    }
  }, [liveComments]);

  const handleSendComment = () => {
    if (commentText.trim()) {
      setLiveComments([...liveComments, { user: "You", text: commentText.trim() }]);
      setCommentText("");
    }
  };

  const handleGift = (gift: typeof giftTiers[0]) => {
    setLiveComments([...liveComments, { user: "You", text: `${gift.icon} You sent a ${gift.name}!` }]);
    setShowGifts(false);
    showToast(`${gift.icon} ${gift.name} sent! -${gift.cost} coins`);
    // Floating gift animation
    const id = ++giftIdRef.current;
    setFloatingGifts((prev) => [...prev, { id, icon: gift.icon }]);
    setTimeout(() => {
      setFloatingGifts((prev) => prev.filter((g) => g.id !== id));
    }, 3000);
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setLiveComments([...liveComments, { user: "You", text: "❤️ liked the stream" }]);
    }
  };

  const handleSelectStream = (stream: typeof liveStreams[0]) => {
    setFeaturedStream(stream);
    setViewerCount(stream.viewers);
    setIsFollowing(false);
    setLiked(false);
    setLiveComments(initialComments);
    setJoiningStream(false);
    showToast(`Now watching ${stream.name}`);
  };

  const handleAddToCart = (product: typeof liveProducts[0]) => {
    setCart((prev) => [...prev, product]);
    showToast(`Added ${product.name} to cart`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${featuredStream.name} is LIVE on VOXel`,
      text: `Watch ${featuredStream.name} live now on VOXel!`,
      url: typeof window !== "undefined" ? `${window.location.origin}/live` : "/live",
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled share */
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Stream link copied!");
      } catch {
        showToast("Stream link copied!");
      }
    } else {
      showToast("Stream link copied!");
    }
  };

  const handleJoinStream = () => {
    if (joiningStream) return;
    setJoiningStream(true);
    setTimeout(() => setJoiningStream(false), 1000);
  };

  const handleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      if (next) showToast(`Following ${featuredStream.name}!`);
      return next;
    });
  };

  const filteredStreams = activeCategory === "All"
    ? liveStreams
    : liveStreams.filter((s) => s.category === activeCategory);

  const handlePlaceBid = (auctionId: number) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return;
    const bid = parseFloat(bidAmount);
    if (bid > auction.currentBid) {
      setAuctions(auctions.map((a) =>
        a.id === auctionId ? { ...a, currentBid: bid, bids: a.bids + 1 } : a
      ));
      showToast(`Bid placed: GH₵ ${bid.toFixed(2)}!`);
      setBiddingOn(null);
      setBidAmount("");
    } else {
      showToast("Bid must be higher than current bid!");
    }
  };

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-16 lg:pb-0">
      {/* ═══════ STICKY TOP BAR ═══════ */}
      <div
        className="sticky top-0 z-50 glass-strong backdrop-blur-xl px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-vox-danger rounded-full animate-pulse" />
          <h1 className="text-lg font-extrabold text-white tracking-tight">LIVE</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/marketplace")}
            className="relative w-9 h-9 rounded-full glass flex items-center justify-center touch-feedback"
            aria-label="View cart"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-vox-pink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push("/create")}
            className="btn-gradient text-white rounded-full px-4 py-2 text-sm font-semibold touch-feedback inline-flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4" />
            Go Live
          </button>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-3 sm:px-4 pt-6 pb-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-vox-pink/10 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-vox-purple/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Go <span className="text-gradient">LIVE</span>. Earn Together.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-vox-muted mt-3 text-sm md:text-base max-w-lg mx-auto"
          >
            Stream, sell, auction, and earn with your community in real time.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onClick={() => router.push("/create")}
            className="btn-gradient text-white font-semibold rounded-2xl text-sm sm:text-base px-5 py-2.5 sm:px-6 sm:py-3 mt-5 inline-flex items-center gap-2 touch-feedback"
          >
            <Radio className="w-5 h-5" />
            Go LIVE Now
          </motion.button>
        </div>
      </motion.div>

      {/* ═══════ PAGE CONTENT ═══════ */}
      <div className="px-3 sm:px-4 pb-16 lg:pb-0 space-y-10 max-w-5xl mx-auto">
        {/* ── FEATURED LIVE STREAM ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <SectionHeader icon={Star} title="Featured Live" onSeeAll={() => router.push("/explore")} />
          <div className="h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden relative touch-feedback card-hover">
            <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredStream.thumbnail} alt={`Featured live stream - ${featuredStream.name}`} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-vox-purple/20 rounded-full blur-[80px] animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-vox-pink/20 rounded-full blur-[60px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
              </div>

              <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
                <span className="bg-vox-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
                <span className="flex items-center gap-1 glass text-white text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-full">
                  <Eye className="w-3.5 h-3.5" />
                  {viewerCount.toLocaleString()} watching
                </span>
              </div>

              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                <motion.div animate={{ y: [0, -10, 0], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-base">💎</span>
                  <span className="text-xs text-white font-medium">x3</span>
                </motion.div>
                <motion.div animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }} className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-base">🔥</span>
                  <span className="text-xs text-white font-medium">x7</span>
                </motion.div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    handleJoinStream();
                  }}
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform touch-feedback"
                >
                  {isPlaying ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white fill-white ml-1" />}
                </button>
              </div>

              {/* Joining stream overlay */}
              <AnimatePresence>
                {joiningStream && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-10 h-10 rounded-full border-2 border-white/20 border-t-vox-pink"
                      />
                      <p className="text-white text-sm font-semibold">Joining stream...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredStream.avatar} alt={`${featuredStream.name} avatar`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-white text-base sm:text-lg font-bold">{featuredStream.name}</p>
                        <BadgeCheck className="w-4 h-4 text-vox-cyan" />
                      </div>
                      <p className="text-white/60 text-xs sm:text-sm">{featuredStream.category} Stream</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center touch-feedback hover:bg-white/20 transition-colors"
                      aria-label="Share stream"
                    >
                      <Share className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleFollow}
                      className={`text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all touch-feedback ${
                        isFollowing ? "bg-white/10 border border-white/20" : "btn-gradient"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>

                <div ref={commentRef} className="mt-3 space-y-1.5 max-h-24 overflow-y-auto scrollbar-hide">
                  {liveComments.map((comment, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className={`text-xs font-semibold ${comment.user === "You" ? "text-vox-pink" : "text-vox-cyan"}`}>{comment.user}</span>
                      <span className="text-xs text-white/80">{comment.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                      placeholder="Say something..."
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
                    />
                    <button onClick={handleSendComment} className="text-vox-pink hover:text-vox-pink/80 transition-colors touch-feedback">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={handleLike}
                    className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors touch-feedback ${liked ? "bg-vox-pink/30" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "text-vox-pink fill-vox-pink" : "text-white"}`} />
                  </button>
                  <button
                    onClick={() => setShowGifts(!showGifts)}
                    className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors touch-feedback"
                  >
                    <Gift className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Gift panel */}
                <AnimatePresence>
                  {showGifts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="grid grid-cols-6 gap-2 bg-white/5 rounded-2xl p-2">
                        {giftTiers.map((gift) => (
                          <button
                            key={gift.name}
                            onClick={() => handleGift(gift)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors touch-feedback"
                          >
                            <span className="text-xl">{gift.icon}</span>
                            <span className="text-[9px] text-white font-medium">{gift.cost}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── CATEGORY PILLS ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`shrink-0 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium touch-feedback whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.label ? "btn-gradient text-white" : "glass text-vox-muted hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── LIVE STREAMS GRID ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <SectionHeader icon={Radio} title="Live Now" onSeeAll={() => router.push("/explore")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredStreams.map((stream, i) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                onClick={() => handleSelectStream(stream)}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer touch-feedback card-hover"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stream.thumbnail} alt={`${stream.name} live stream thumbnail`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  <span className="bg-vox-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 glass text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                  <Eye className="w-3 h-3 text-white/80" />
                  <span>{stream.viewersLabel}</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={stream.avatar} alt={`${stream.name} avatar`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate">{stream.name}</p>
                      <p className="text-xs text-vox-muted">{stream.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredStreams.length === 0 && (
            <div className="text-center py-12 text-vox-muted text-sm">No live streams in {activeCategory} right now</div>
          )}
        </motion.section>

        {/* ── LIVE SHOPPING ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <SectionHeader icon={ShoppingBag} title="Live Shopping" onSeeAll={() => router.push("/marketplace")} />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4 pb-2">
            {liveProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="w-40 sm:w-48 shrink-0 glass rounded-2xl overflow-hidden touch-feedback card-hover group"
              >
                <div className="aspect-square relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.productImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-vox-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 glass text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3 text-white/80" />
                    <span>{product.viewers}</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                  <p className="text-xs text-vox-muted mt-0.5">by {product.seller}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-sm font-bold text-vox-pink">{product.price}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-gradient text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-xl touch-feedback"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── LIVE AUCTIONS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <SectionHeader icon={Gavel} title="Live Auctions" onSeeAll={() => router.push("/explore")} />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4 pb-2">
            {auctions.map((auction) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-64 sm:w-72 shrink-0 glass rounded-2xl overflow-hidden touch-feedback card-hover p-4"
              >
                <div className="w-full aspect-[2/1] rounded-xl bg-gradient-to-br from-vox-purple/30 to-vox-pink/30 flex items-center justify-center mb-3 relative overflow-hidden">
                  <Gavel className="w-8 h-8 text-white/30" />
                  <div className="absolute top-2 right-2 text-[10px] font-bold bg-vox-danger/20 text-vox-danger px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-vox-danger rounded-full animate-pulse" />
                    {auction.timeLeft}
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">{auction.name}</p>
                <p className="text-xs text-vox-muted mt-0.5">by {auction.seller}</p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-[10px] text-vox-muted uppercase tracking-wider">Current Bid</p>
                    <p className="text-sm font-bold text-vox-green">GH₵ {auction.currentBid.toLocaleString()}</p>
                    <p className="text-[10px] text-vox-muted mt-0.5">{auction.bids} bids</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setBiddingOn(biddingOn === auction.id ? null : auction.id)}
                      className="btn-gradient text-white text-xs font-semibold rounded-full px-3 py-1.5 touch-feedback"
                    >
                      Place Bid
                    </button>
                    <AnimatePresence>
                      {biddingOn === auction.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex items-center gap-2"
                        >
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`> ${auction.currentBid}`}
                            className="w-20 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-vox-purple"
                          />
                          <button
                            onClick={() => handlePlaceBid(auction.id)}
                            className="text-xs font-semibold text-vox-green px-2 py-1 rounded-lg hover:bg-vox-green/10 touch-feedback"
                          >
                            Confirm
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── GIFT TIERS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <SectionHeader icon={Gift} title="Gift Tiers" onSeeAll={() => router.push("/wallet")} />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {giftTiers.map((gift, i) => (
              <motion.button
                key={gift.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGift(gift)}
                className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 touch-feedback card-hover group"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                <span className="text-xs font-semibold text-white">{gift.name}</span>
                <span className="text-[10px] text-vox-muted flex items-center gap-0.5">
                  <Diamond className="w-2.5 h-2.5 text-vox-cyan" />
                  {gift.cost}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>

      {/* ═══════ FLOATING GIFTS ═══════ */}
      <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
        <AnimatePresence>
          {floatingGifts.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: "100%", x: "-50%", scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: "-20vh", x: "-50%", scale: [0.5, 1.4, 1.2, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 text-5xl drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
            >
              {g.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 z-[60] glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
