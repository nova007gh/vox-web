"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import FeedPosts from "./FeedPosts";
import {
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Bookmark,
  MoreHorizontal,
  Music,
  Play,
  Volume2,
  VolumeX,
  BadgeCheck,
  Crown,
  Flame,
  Plus,
  Eye,
  Hash,
  UserPlus,
  X,
  Copy,
  AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const videos = [
  {
    id: 1,
    creator: "JUST WEAR WIGS",
    handle: "@just_wearwigs",
    verified: true,
    popular: true,
    elite: true,
    caption: "Ready to wear wig unboxing! 💇‍♀️ Which one is your favorite? #hairgoals",
    sound: "Original Sound - JUST WEAR WIGS",
    likes: "12.4K",
    comments: "356",
    shares: "872",
    hashtags: ["wigs", "hair", "vox", "ghana", "beauty"],
    gradient: "from-purple-900 via-indigo-900 to-pink-950",
    isLive: false,
    avatar: "/profiles/justwearwigs/avatar.jpeg",
    thumbnail: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=600&h=900&auto=format&fit=crop",
  },
  {
    id: 2,
    creator: "Glow By Nana",
    handle: "@glowbynana",
    verified: true,
    popular: false,
    elite: false,
    caption: "Frontal ponytail install tutorial ✨ Book your appointment today!",
    sound: "Afrobeats Mix - DJ Spinall",
    likes: "3.5K",
    comments: "128",
    shares: "245",
    hashtags: ["frontal", "ponytail", "hair", "beauty"],
    gradient: "from-orange-950 via-red-950 to-rose-950",
    isLive: false,
    avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=600&h=900&auto=format&fit=crop",
  },
  {
    id: 3,
    creator: "Berry Beauty",
    handle: "@berrybeauty",
    verified: true,
    popular: true,
    elite: false,
    caption: "Lace frontal installation 🔥 LIVE tutorial! Ask me anything",
    sound: "Highlife Remix - Sarkodie",
    likes: "8.2K",
    comments: "412",
    shares: "1.2K",
    hashtags: ["lacefrontal", "hair", "beauty", "tutorial"],
    gradient: "from-cyan-950 via-blue-950 to-indigo-950",
    isLive: true,
    viewers: "2.1K",
    avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=600&h=900&auto=format&fit=crop",
  },
  {
    id: 4,
    creator: "Hair By Maame",
    handle: "@hairbymaame",
    verified: true,
    popular: true,
    elite: false,
    caption: "Hair extensions transformation! From short to long in 2 hours 💁‍♀️",
    sound: "Ghana Vibes - Berry Beauty",
    likes: "15.2K",
    comments: "892",
    shares: "2.1K",
    hashtags: ["hairextensions", "transformation", "ghana", "beauty"],
    gradient: "from-amber-950 via-yellow-950 to-orange-950",
    isLive: false,
    avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=600&h=900&auto=format&fit=crop",
  },
  {
    id: 5,
    creator: "Afro Queen",
    handle: "@afroqueen",
    verified: true,
    popular: false,
    elite: true,
    caption: "Natural hair care routine! Love your afro 👑 #naturalhair",
    sound: "Amapiano Beat - DJ Flex",
    likes: "6.7K",
    comments: "234",
    shares: "567",
    hashtags: ["naturalhair", "afro", "beauty", "haircare"],
    gradient: "from-rose-950 via-pink-950 to-fuchsia-950",
    isLive: false,
    avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1613730318129-bf0ca2a12364?fm=jpg&q=60&w=600&h=900&auto=format&fit=crop",
  },
];

const suggestedAccounts = [
  { name: "SNY Obeng", handle: "@snyobeng", username: "snyobeng", initials: "SO", avatar: "/profiles/snyobeng/123121.jpeg" },
  { name: "Wigs By Akua", handle: "@wigsbyakua", username: "wigsbyakua", initials: "WA", avatar: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Slayed By Esi", handle: "@slayedbyesi", username: "slayedbyesi", initials: "SE", avatar: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Afro Queen", handle: "@afroqueen", username: "afroqueen", initials: "AQ", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Glow By Nana", handle: "@glowbynana", username: "glowbynana", initials: "GN", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Berry Beauty", handle: "@berrybeauty", username: "berrybeauty", initials: "BB", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Hair By Maame", handle: "@hairbymaame", username: "hairbymaame", initials: "HM", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Mandiya Joseph", handle: "@mandiyajoseph", username: "mandiyajoseph", initials: "MJ", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Haroon Twins", handle: "@haroontwins", username: "haroontwins", initials: "HT", avatar: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Afro Figo", handle: "@afro_figo", username: "afro_figo", initials: "AF", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Chef Abbys", handle: "@chefabbys", username: "chefabbys", initials: "CA", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "De Breezx", handle: "@de_breezx", username: "de_breezx", initials: "DB", avatar: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
];

const trendingHashtags = [
  { tag: "afrobeats", views: "14.2M" },
  { tag: "ghanadance", views: "8.7M" },
  { tag: "viralchallenge", views: "6.3M" },
  { tag: "voxcreator", views: "4.1M" },
  { tag: "highlife", views: "2.9M" },
];

const discoverPills = [
  "Music",
  "Dance",
  "Comedy",
  "Food",
  "Fashion",
  "Sports",
  "Tech",
  "Art",
];

const tabs = [
  { key: "foryou", label: "For You" },
  { key: "following", label: "Following" },
  { key: "trending", label: "Trending" },
  { key: "ghana", label: "Ghana", emoji: "\u{1F1EC}\u{1F1ED}" },
  { key: "live", label: "Live", live: true },
];

const giftOptions = [
  { emoji: "🌹", name: "Rose", cost: 5 },
  { emoji: "🧸", name: "Teddy", cost: 10 },
  { emoji: "👑", name: "Crown", cost: 50 },
  { emoji: "💎", name: "Diamond", cost: 100 },
  { emoji: "🚀", name: "Rocket", cost: 200 },
  { emoji: "🏆", name: "Trophy", cost: 500 },
];

const reportReasons = ["Spam", "Harassment", "Misinformation", "Hate Speech", "Other"];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function HomeFeed() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("foryou");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<number>>(new Set());
  const [followedCreators, setFollowedCreators] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // ── Modal / interaction state ──
  const [toast, setToast] = useState<string | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [coinBalance, setCoinBalance] = useState(500);
  const [hiddenVideos, setHiddenVideos] = useState<Set<number>>(new Set());
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const visibleVideos = videos.filter((v) => !hiddenVideos.has(v.id));
  const safeIndex = Math.min(currentIndex, visibleVideos.length - 1);
  const video = visibleVideos[safeIndex];

  /* ── Navigation ── */
  const goToVideo = useCallback(
    (newIndex: number, dir: number) => {
      if (isAnimating.current) return;
      if (newIndex < 0 || newIndex >= visibleVideos.length) return;
      isAnimating.current = true;
      setDirection(dir);
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      setTimeout(() => {
        isAnimating.current = false;
      }, 450);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleVideos.length]
  );

  const goNext = useCallback(() => goToVideo(currentIndex + 1, 1), [currentIndex, goToVideo]);
  const goPrev = useCallback(() => goToVideo(currentIndex - 1, -1), [currentIndex, goToVideo]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      else if (e.key === "ArrowUp" || e.key === "k") goPrev();
      else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "m") setIsMuted((m) => !m);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  /* ── Mouse wheel ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cooldown = false;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cooldown) return;
      cooldown = true;
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
      setTimeout(() => {
        cooldown = false;
      }, 600);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  /* ── Swipe ── */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60) goNext();
    else if (info.offset.y > 60) goPrev();
  };

  /* ── Clamp index when videos are hidden ── */
  useEffect(() => {
    if (visibleVideos.length > 0 && currentIndex >= visibleVideos.length) {
      setCurrentIndex(visibleVideos.length - 1);
    }
  }, [visibleVideos.length, currentIndex]);

  /* ── Toggles ── */
  const toggleLike = (id: number) => {
    setLikedVideos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedVideos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  /* ── Share ── */
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://voxel.app";
    const shareData = {
      title: `${video.creator} on VOXel`,
      text: `${video.caption} ${video.hashtags.map((t) => `#${t}`).join(" ")}`,
      url: shareUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        /* clipboard not available */
      }
      showToast("Link copied!");
    }
  };

  /* ── Gift ── */
  const handleSendGift = (gift: { emoji: string; name: string; cost: number }) => {
    if (coinBalance >= gift.cost) {
      setCoinBalance((prev) => prev - gift.cost);
      showToast(`Sent ${gift.emoji} ${gift.name} to ${video.creator}!`);
      setShowGiftModal(false);
    } else {
      showToast("Not enough coins!");
    }
  };

  /* ── Not Interested ── */
  const handleNotInterested = () => {
    setHiddenVideos((prev) => {
      const s = new Set(prev);
      s.add(video.id);
      return s;
    });
    setShowMoreMenu(false);
    showToast("Video removed from feed");
  };

  /* ── Report ── */
  const handleSubmitReport = () => {
    setShowReportModal(false);
    setShowMoreMenu(false);
    setReportReason(null);
    showToast("Report submitted. Thank you.");
  };

  /* ── Embed ── */
  const embedCode = `<iframe src="https://voxel.app/embed/${video.id}" width="375" height="667" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  /* ── Slide animation variants ── */
  const slideVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? "100%" : "-100%", opacity: 0.5 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? "-100%" : "100%", opacity: 0.5 }),
  };

  return (
    <div className="flex h-full w-full">
      {/* ═══════════════════════════════════════════
          MAIN FEED
          ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] lg:h-screen relative min-w-0" ref={containerRef}>
        {/* ── TOP TAB BAR (segmented control) ── */}
        <div className="sticky top-0 z-40 glass-strong backdrop-blur-xl border-b border-white/[0.06]" style={{ paddingTop: "var(--safe-top)" }}>
          {/* Location / region pill */}
          <div className="flex items-center justify-center px-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-vox-muted bg-white/[0.04] rounded-full px-2.5 py-1">
              <span>🇬🇭 Ghana</span>
              <span className="flex items-center gap-1 text-white/80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 sm:px-4 h-11 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === "live") { router.push("/live"); return; }
                    if (tab.key === "ghana") { router.push("/explore"); return; }
                    setActiveTab(tab.key);
                  }}
                  className={`touch-feedback relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                    active ? "text-white" : "text-vox-muted"
                  }`}
                >
                  {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                  {tab.label}
                  {tab.live && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="feed-tab-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #7C2CFF, #FF2C91, #FF8A34)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE DISCOVER STRIP (suggested accounts + trending + discover) ── */}
        <div className="lg:hidden flex flex-col gap-2.5 py-2.5 border-b border-white/[0.06] bg-vox-bg/80 backdrop-blur-sm">
          {/* Suggested accounts horizontal scroll */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-vox-muted uppercase tracking-wide px-3">Suggested</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3">
              {suggestedAccounts.map((acc) => (
                <Link
                  key={acc.handle}
                  href={`/profile/${acc.username}`}
                  className="touch-feedback flex flex-col items-center gap-1.5 w-24 sm:w-28 shrink-0"
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #7C2CFF, #FF2C91)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={acc.avatar} alt={acc.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <p className="text-[11px] font-medium text-white truncate w-full text-center">{acc.name}</p>
                  <p className="text-[10px] text-vox-muted truncate w-full text-center">{acc.handle}</p>
                </Link>
              ))}
            </div>
          </div>
          {/* Trending hashtags + discover pills horizontal scroll */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-vox-muted uppercase tracking-wide px-3">Trending</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3">
              {trendingHashtags.map((item) => (
                <Link
                  key={item.tag}
                  href="/explore"
                  className="touch-feedback flex items-center gap-1 glass rounded-full px-3 py-1.5 text-xs font-medium text-vox-muted whitespace-nowrap"
                >
                  <Hash className="w-3 h-3" />
                  {item.tag}
                </Link>
              ))}
              {discoverPills.map((pill) => (
                <Link
                  key={pill}
                  href="/explore"
                  className="touch-feedback glass rounded-full px-3 py-1.5 text-xs font-medium text-vox-muted whitespace-nowrap"
                >
                  {pill}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── VIDEO FEED AREA ── */}
        <div className="flex-1 relative overflow-hidden snap-y snap-mandatory">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={video.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 snap-start snap-always cursor-grab active:cursor-grabbing"
              onClick={() => setIsPlaying((p) => !p)}
            >
              {/* Video background with image */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`}
              >
                {/* Video thumbnail image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl" />
                  <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/[0.04] blur-2xl" />
                </div>
              </div>

              {/* Live badge */}
              {video.isLive && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    LIVE
                  </span>
                  {"viewers" in video && (
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      {video.viewers}
                    </span>
                  )}
                </div>
              )}

              {/* Mute button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((m) => !m);
                }}
                className="touch-feedback absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Play/Pause overlay */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                  >
                    <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              {/* ── Bottom-left overlay ── */}
              <div className="absolute bottom-4 left-3 right-16 sm:right-20 z-10 space-y-2 sm:space-y-2.5 lg:bottom-6 lg:left-6">
                {/* Creator info */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Avatar with gradient ring */}
                  <div className="relative flex-shrink-0">
                    <Link href="/profile" onClick={(e) => e.stopPropagation()} className="touch-feedback block">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(135deg, #7C2CFF, #FF2C91, #FF8A34)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.avatar}
                          alt={video.creator}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <Link href="/profile" onClick={(e) => e.stopPropagation()} className="touch-feedback">
                      <span className="text-white font-bold text-sm truncate">
                        {video.creator}
                      </span>
                    </Link>
                    {/* Badges */}
                    {video.verified && (
                      <BadgeCheck className="w-4 h-4 text-vox-cyan flex-shrink-0" />
                    )}
                    {video.popular && (
                      <Flame className="w-4 h-4 text-vox-orange flex-shrink-0" />
                    )}
                    {video.elite && (
                      <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                    {/* Follow button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setFollowedCreators(prev => { const s = new Set(prev); if (s.has(video.id)) { s.delete(video.id); } else { s.add(video.id); } return s; }); }}
                      className={`touch-feedback ml-1 flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all ${
                        followedCreators.has(video.id)
                          ? "text-vox-muted border border-white/10"
                          : "text-white"
                      }`}
                      style={!followedCreators.has(video.id) ? {
                        background:
                          "linear-gradient(135deg, rgba(124,44,255,0.3), rgba(255,44,145,0.3))",
                        border: "1px solid rgba(255,255,255,0.2)",
                      } : undefined}
                    >
                      {followedCreators.has(video.id) ? (
                        "Following"
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-white/90 text-xs leading-relaxed break-words line-clamp-2">
                  {video.caption}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5">
                  {video.hashtags.map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); router.push("/explore"); }}
                      className="text-vox-cyan text-xs font-medium cursor-pointer hover:underline"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Sound / Music with marquee */}
                <div
                  className="flex items-center gap-2 max-w-[200px] sm:max-w-[260px] cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); router.push("/explore"); }}
                >
                  <Music className="w-3.5 h-3.5 text-white/70 flex-shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
                  <div className="overflow-hidden flex-1">
                    <div className="animate-marquee whitespace-nowrap text-white/70 text-xs">
                      <span className="inline-block pr-8">{video.sound}</span>
                      <span className="inline-block pr-8">{video.sound}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right-side action buttons ── */}
              <div className="absolute right-2 sm:right-3 bottom-24 sm:bottom-20 z-10 flex flex-col items-center gap-3 sm:gap-4 lg:right-5 lg:bottom-1/4">
                {/* Profile avatar */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push("/profile"); }}
                    className="touch-feedback w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] block overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C2CFF, #FF2C91, #FF8A34)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.avatar}
                      alt={video.creator}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </button>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-vox-pink flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Like */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(video.id);
                  }}
                  className="touch-feedback flex flex-col items-center gap-1 group w-11 h-11 sm:w-12 sm:h-12 justify-center"
                >
                  <motion.div whileTap={{ scale: 1.4 }}>
                    <Heart
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                        likedVideos.has(video.id)
                          ? "fill-vox-pink text-vox-pink"
                          : "text-white"
                      }`}
                    />
                  </motion.div>
                  <span className="text-[10px] font-semibold text-white">
                    {video.likes}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={(e) => { e.stopPropagation(); router.push("/messages"); }}
                  className="touch-feedback flex flex-col items-center gap-1 group w-11 h-11 sm:w-12 sm:h-12 justify-center"
                >
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-colors" />
                  <span className="text-[10px] font-semibold text-white">
                    {video.comments}
                  </span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="touch-feedback flex flex-col items-center gap-1 group w-11 h-11 sm:w-12 sm:h-12 justify-center"
                >
                  <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-colors" />
                  <span className="text-[10px] font-semibold text-white">
                    {video.shares}
                  </span>
                </button>

                {/* Gift */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowGiftModal(true); }}
                  className="touch-feedback flex flex-col items-center gap-1 group w-11 h-11 sm:w-12 sm:h-12 justify-center"
                >
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-colors" />
                  <span className="text-[10px] font-semibold text-white">
                    Gift
                  </span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(video.id);
                  }}
                  className="touch-feedback flex flex-col items-center gap-1 group w-11 h-11 sm:w-12 sm:h-12 justify-center"
                >
                  <Bookmark
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                      bookmarkedVideos.has(video.id)
                        ? "fill-vox-orange text-vox-orange"
                        : "text-white"
                    }`}
                  />
                </button>

                {/* More */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu((s) => !s); }}
                    className="touch-feedback group w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center"
                  >
                    <MoreHorizontal className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-colors" />
                  </button>
                  <AnimatePresence>
                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-[65]" onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); }} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -8 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 bottom-14 z-[66] glass-strong rounded-2xl py-1.5 w-44 shadow-2xl"
                        >
                          <button
                            onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }}
                            className="touch-feedback w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.06] transition-colors text-left"
                          >
                            <AlertCircle className="w-4 h-4 text-vox-pink" />
                            Report
                          </button>
                          <button
                            onClick={handleNotInterested}
                            className="touch-feedback w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.06] transition-colors text-left"
                          >
                            <X className="w-4 h-4 text-vox-muted" />
                            Not Interested
                          </button>
                          <button
                            onClick={() => { setShowMoreMenu(false); setShowEmbedModal(true); }}
                            className="touch-feedback w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.06] transition-colors text-left"
                          >
                            <Copy className="w-4 h-4 text-vox-cyan" />
                            Embed
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Progress bar ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/20">
            <motion.div
              key={video.id}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #7C2CFF, #FF2C91, #FF8A34)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: isPlaying ? "100%" : undefined }}
              transition={
                isPlaying
                  ? { duration: 15, ease: "linear" }
                  : { duration: 0 }
              }
            />
          </div>

          {/* ── Video index dots (right edge) ── */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-1.5">
            {visibleVideos.map((_, i) => (
              <button
                key={i}
                onClick={() => goToVideo(i, i > safeIndex ? 1 : -1)}
                className={`touch-feedback w-1.5 rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? "h-6 bg-gradient-to-b from-vox-purple to-vox-pink"
                    : "h-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT SIDEBAR (desktop lg+)
          ═══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[300px] flex-shrink-0 h-screen border-l border-white/[0.06] bg-vox-bg overflow-y-auto scrollbar-hide">
        {/* Spacer for tab bar alignment */}
        <div className="h-12 flex items-center px-5 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-vox-muted uppercase tracking-wider">
            Discover
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 scrollbar-hide">
          {/* ── Suggested Accounts ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                Suggested Accounts
              </h3>
              <button onClick={() => router.push("/explore")} className="touch-feedback text-xs text-vox-pink hover:underline">
                See all
              </button>
            </div>
            <div className="space-y-2.5">
              {suggestedAccounts.map((acc) => (
                <Link
                  key={acc.handle}
                  href={`/profile/${acc.username}`}
                  className="touch-feedback flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-full p-[1.5px] flex-shrink-0 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C2CFF, #FF2C91)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-vox-muted truncate">
                      {acc.handle}
                    </p>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="touch-feedback flex items-center gap-1 text-[11px] font-semibold text-vox-pink border border-vox-pink/40 rounded-full px-2.5 py-1 hover:bg-vox-pink/10 transition-colors opacity-0 group-hover:opacity-100">
                    <UserPlus className="w-3 h-3" />
                    Follow
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent Posts from Community ── */}
          <FeedPosts />

          {/* ── Trending ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Trending</h3>
              <button onClick={() => router.push("/explore")} className="touch-feedback text-xs text-vox-pink hover:underline">
                See all
              </button>
            </div>
            <div className="space-y-2">
              {trendingHashtags.map((item) => (
                <Link
                  key={item.tag}
                  href="/explore"
                  className="touch-feedback flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-vox-purple/20 transition-colors">
                    <Hash className="w-4 h-4 text-vox-muted group-hover:text-vox-purple transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      #{item.tag}
                    </p>
                    <p className="text-[11px] text-vox-muted">
                      {item.views} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Discover pills ── */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Discover</h3>
            <div className="flex flex-wrap gap-2">
              {discoverPills.map((pill) => (
                <Link
                  key={pill}
                  href="/explore"
                  className="touch-feedback text-xs font-medium text-vox-muted px-3 py-1.5 rounded-full border border-white/10 hover:border-vox-purple/50 hover:text-white hover:bg-vox-purple/10 transition-all"
                >
                  {pill}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-vox-muted/60 leading-relaxed">
              About &middot; Terms &middot; Privacy &middot; Community Guidelines
              <br />
              &copy; 2025 VOXel
            </p>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          GIFT MODAL
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowGiftModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-3xl p-5 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Send a Gift</h3>
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <p className="text-xs text-vox-muted mb-4">
                Balance:{" "}
                <span className="text-vox-cyan font-bold">{coinBalance} coins</span>
              </p>
              <div className="grid grid-cols-4 gap-3">
                {giftOptions.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => handleSendGift(g)}
                    className="glass rounded-2xl p-3 flex flex-col items-center gap-1 touch-feedback card-hover"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-[10px] text-white font-medium">{g.name}</span>
                    <span className="text-[10px] text-vox-orange">{g.cost}🪙</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => router.push("/wallet")}
                className="w-full mt-4 glass rounded-xl py-2.5 text-xs text-vox-muted touch-feedback"
              >
                Get more coins →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          REPORT MODAL
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-3xl p-5 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Report Video</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                {reportReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm touch-feedback transition-colors ${
                      reportReason === r
                        ? "btn-gradient text-white"
                        : "glass text-vox-muted"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (reportReason) {
                    handleSubmitReport();
                  } else {
                    showToast("Please select a reason");
                  }
                }}
                className="w-full btn-gradient rounded-xl py-3 text-sm font-semibold text-white touch-feedback"
              >
                Submit Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          EMBED MODAL
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showEmbedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowEmbedModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-3xl p-5 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Embed Video</h3>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <p className="text-xs text-vox-muted mb-3">
                Copy this code to embed the video on your website:
              </p>
              <textarea
                readOnly
                className="w-full bg-white/[0.06] rounded-xl p-3 text-xs text-vox-muted font-mono resize-none h-24 scrollbar-hide"
                value={embedCode}
              />
              <button
                onClick={handleCopyEmbed}
                className="w-full mt-3 btn-gradient rounded-xl py-2.5 text-sm font-semibold text-white touch-feedback"
              >
                {copiedEmbed ? "Copied!" : "Copy Code"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          TOAST NOTIFICATION
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] px-4 py-2.5 glass-strong rounded-full text-sm font-semibold text-white shadow-xl shadow-black/30 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          INLINE STYLES (marquee animation)
          ═══════════════════════════════════════════ */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 8s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
