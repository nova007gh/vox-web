"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
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
  Plus,
  Eye,
  Hash,
  X,
  Copy,
  AlertCircle,
  Sparkles,
  Send,
} from "lucide-react";
import {
  subscribeToFeedPosts,
  toggleLike as fbToggleLike,
  toggleSave as fbToggleSave,
  addComment,
  incrementShare,
  incrementView,
  getFileURL,
  timeAgo,
  formatCount,
  type Post,
  type Comment,
} from "@/lib/firebase-store";
import { useAuth } from "@/lib/auth-context";
import { accounts } from "@/lib/accounts";
import { addNotification } from "@/lib/content-store";

const trendingHashtags = [
  { tag: "afrobeats" },
  { tag: "ghanadance" },
  { tag: "viralchallenge" },
  { tag: "voxcreator" },
  { tag: "highlife" },
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
  { key: "foryou", label: "For You", dot: "#7C2CFF", glow: "shadow-[0_0_8px_#7C2CFF]" },
  { key: "following", label: "Following", dot: "#22D3EE", glow: "shadow-[0_0_8px_#22D3EE]" },
  { key: "trending", label: "Trending", dot: "#FF2C91", glow: "shadow-[0_0_8px_#FF2C91]" },
  { key: "ghana", label: "Ghana", dot: "#FF8A34", glow: "shadow-[0_0_8px_#FF8A34]", emoji: "\u{1F1EC}\u{1F1ED}" },
  { key: "live", label: "Live", dot: "#EF4444", glow: "shadow-[0_0_8px_#EF4444]", live: true },
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
   VIDEO PLAYER - loads video from IndexedDB
   ═══════════════════════════════════════════ */
function FeedVideoPlayer({ post, isPlaying, isMuted }: { post: Post; isPlaying: boolean; isMuted: boolean }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const directUrl = post.mediaUrls?.[0];
    if (directUrl && (directUrl.startsWith("http://") || directUrl.startsWith("https://") || directUrl.startsWith("blob:"))) {
      setVideoUrl(directUrl);
      setLoading(false);
    } else if (post.mediaIds[0]) {
      getFileURL(post.mediaIds[0]).then((url) => {
        if (url) setVideoUrl(url);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [post.mediaIds, post.mediaUrls]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // Fallback: show thumbnail
  const thumb = post.thumbnailUrl || post.mediaUrls?.[0] || "";
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt={post.caption} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <div className="text-center">
          <Play className="w-16 h-16 text-white/80 mx-auto mb-2" />
          <p className="text-xs text-white/60">Video available on original device</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   COMMENT MODAL
   ═══════════════════════════════════════════ */
function CommentModal({ post, onClose, onUpdate }: { post: Post; onClose: () => void; onUpdate?: (postId: string, comment: Comment) => void }) {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const handleSend = async () => {
    const text = commentText.trim();
    if (!text || !currentUser) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: Date.now(),
      likes: 0,
    };
    setComments(prev => [...prev, newComment]);
    onUpdate?.(post.id, newComment);
    await addComment(post.id, newComment);
    // Send notification to post author
    if (post.authorUsername !== currentUser.username) {
      addNotification(post.authorUsername, {
        type: "comment",
        fromUsername: currentUser.username,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatar || "",
        message: "commented on your post",
        detail: `"${text.slice(0, 40)}"`,
        postId: post.id,
      });
    }
    setCommentText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{comments.length} Comments</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback">
            <X className="w-4 h-4 text-vox-muted" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide">
          {comments.length === 0 ? (
            <p className="text-center text-vox-muted text-sm py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink flex-shrink-0 overflow-hidden">
                  {c.authorAvatar && c.authorAvatar.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.authorAvatar} alt={c.authorName} className="w-full h-full object-cover" />
                  ) : c.authorAvatar ? (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{c.authorName}</p>
                  <p className="text-sm text-white/80 break-words">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Add a comment..."
            className="flex-1 bg-white/[0.06] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-vox-muted/50 focus:outline-none focus:border-vox-purple/40"
          />
          <button
            onClick={handleSend}
            disabled={!commentText.trim()}
            className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center disabled:opacity-40 touch-feedback"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function HomeFeed() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("foryou");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // ── Modal / interaction state ──
  const [toast, setToast] = useState<string | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [coinBalance, setCoinBalance] = useState(500);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Real-time subscription to feed posts from Firebase ──
  useEffect(() => {
    const unsubscribe = subscribeToFeedPosts((feedPosts) => {
      setPosts(feedPosts);
      setLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Initialize liked/saved state from posts
  useEffect(() => {
    if (posts.length > 0) {
      setLikedPosts(new Set(posts.filter(p => p.likedByMe).map(p => p.id)));
      setSavedPosts(new Set(posts.filter(p => p.savedByMe).map(p => p.id)));
    }
  }, [posts]);

  const visiblePosts = posts;
  const safeIndex = Math.min(currentIndex, visiblePosts.length - 1);
  const currentPost = visiblePosts[safeIndex];

  /* ── Navigation ── */
  const goToPost = useCallback(
    (newIndex: number, dir: number) => {
      if (isAnimating.current) return;
      if (newIndex < 0 || newIndex >= visiblePosts.length) return;
      isAnimating.current = true;
      setDirection(dir);
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      // Increment view on new post
      if (visiblePosts[newIndex]) {
        incrementView(visiblePosts[newIndex].id).catch(() => {});
      }
      setTimeout(() => {
        isAnimating.current = false;
      }, 450);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visiblePosts.length]
  );

  const goNext = useCallback(() => goToPost(currentIndex + 1, 1), [currentIndex, goToPost]);
  const goPrev = useCallback(() => goToPost(currentIndex - 1, -1), [currentIndex, goToPost]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showGiftModal || showReportModal || showCommentModal || showMoreMenu) return;
      if (e.key === "ArrowDown") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      else if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, showGiftModal, showReportModal, showCommentModal, showMoreMenu]);

  /* ── Wheel ── */
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

  /* ── Clamp index ── */
  useEffect(() => {
    if (visiblePosts.length > 0 && currentIndex >= visiblePosts.length) {
      setCurrentIndex(visiblePosts.length - 1);
    }
  }, [visiblePosts.length, currentIndex]);

  /* ── Actions ── */
  const updatePost = (postId: string, patch: Partial<Post>) => {
    setPosts(prev =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p))
    );
  };

  const handleLike = async (postId: string) => {
    const newLikedByMe = await fbToggleLike(postId);
    setLikedPosts(prev => {
      const s = new Set(prev);
      if (newLikedByMe) { s.add(postId); } else { s.delete(postId); }
      return s;
    });
    const post = visiblePosts.find((p) => p.id === postId);
    if (post) {
      const newLikes = Math.max(0, post.likes + (newLikedByMe ? 1 : -1));
      updatePost(postId, { likedByMe: newLikedByMe, likes: newLikes });
      // Send notification to post author
      if (newLikedByMe && currentUser) {
        addNotification(post.authorUsername, {
          type: "like",
          fromUsername: currentUser.username,
          fromName: currentUser.name,
          fromAvatar: currentUser.avatar || "",
          message: "liked your post",
          detail: post.caption ? `"${post.caption.slice(0, 40)}"` : undefined,
          postId,
        });
      }
    }
  };

  const handleSave = async (postId: string) => {
    const newSavedByMe = await fbToggleSave(postId);
    setSavedPosts(prev => {
      const s = new Set(prev);
      if (newSavedByMe) { s.add(postId); } else { s.delete(postId); }
      return s;
    });
    const post = visiblePosts.find((p) => p.id === postId);
    if (post) {
      const newSaves = Math.max(0, post.saves + (newSavedByMe ? 1 : -1));
      updatePost(postId, { savedByMe: newSavedByMe, saves: newSaves });
    }
    showToast(newSavedByMe ? "Saved!" : "Removed from saved");
  };

  const handleShare = async (postId: string) => {
    await incrementShare(postId);
    const post = visiblePosts.find((p) => p.id === postId);
    if (post) updatePost(postId, { shares: post.shares + 1 });
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://vox-web-six.vercel.app";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "VOXel", text: "Check out this post!", url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied!");
      } catch { /* clipboard not available */ }
    }
  };

  const handleSendGift = (gift: { emoji: string; name: string; cost: number }) => {
    if (coinBalance >= gift.cost) {
      setCoinBalance((prev) => prev - gift.cost);
      showToast(`Sent ${gift.emoji} ${gift.name}!`);
      setShowGiftModal(false);
      // Send notification to post author
      const post = visiblePosts[currentIndex];
      if (post && currentUser) {
        addNotification(post.authorUsername, {
          type: "gift",
          fromUsername: currentUser.username,
          fromName: currentUser.name,
          fromAvatar: currentUser.avatar || "",
          message: "sent you a gift",
          detail: `${gift.emoji} ${gift.name}`,
          postId: post.id,
        });
      }
    } else {
      showToast("Not enough coins!");
    }
  };

  /* ── Slide animation variants ── */
  const slideVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? "100%" : "-100%", opacity: 0.5 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? "-100%" : "100%", opacity: 0.5 }),
  };

  /* ── Get account info for a post author ── */
  const getAuthorAccount = (username: string) => accounts.find(a => a.username === username);

  /* ── Empty state when no posts ── */
  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-vox-purple/20 to-vox-pink/20 flex items-center justify-center mb-5"
      >
        <Sparkles className="w-10 h-10 text-vox-pink" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">No posts yet</h2>
      <p className="text-sm text-vox-muted mb-6 max-w-xs">
        Be the first to share something with the VOXel community!
      </p>
      <button
        onClick={() => router.push("/create")}
        className="btn-gradient rounded-full px-6 py-3 text-sm font-semibold text-white touch-feedback flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Post
      </button>
    </div>
  );

  /* ── Loading state ── */
  const renderLoading = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
    </div>
  );

  return (
    <div className="flex h-full w-full">
      {/* ═══════════════════════════════════════════
          MAIN FEED - Real posts from Firebase
          ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] lg:h-screen relative min-w-0" ref={containerRef}>
        {/* ── TOP TAB BAR (Snapchat-style transparent with glowing dots) ── */}
        <div className="sticky top-0 z-40 bg-transparent" style={{ paddingTop: "var(--safe-top)" }}>
          <div className="flex items-center justify-center px-2 pt-2 pb-1.5">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/[0.03] backdrop-blur-md rounded-full px-1.5 py-1 border border-white/[0.08]">
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
                    className={`touch-feedback relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 rounded-full ${
                      active ? "text-white bg-white/[0.08]" : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {/* Glowing dot */}
                    <span
                      className={`relative flex h-2 w-2 rounded-full transition-all duration-300 ${active ? tab.glow : "opacity-40"}`}
                      style={{ backgroundColor: tab.dot, boxShadow: active ? `0 0 8px ${tab.dot}, 0 0 4px ${tab.dot}` : "none" }}
                    >
                      {tab.live && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: tab.dot }} />
                      )}
                    </span>
                    {tab.label}
                    {active && (
                      <motion.div
                        layoutId="feed-tab-glow"
                        className="absolute inset-0 rounded-full"
                        style={{ boxShadow: `inset 0 0 12px ${tab.dot}40, 0 0 6px ${tab.dot}30` }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── POST FEED AREA (Snapchat-style vertical video feed) ── */}
        {!loaded ? (
          renderLoading()
        ) : visiblePosts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="flex-1 relative overflow-hidden snap-y snap-mandatory">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentPost.id}
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
                {/* Media background */}
                <div className="absolute inset-0 bg-vox-bg">
                  {currentPost.type === "video" ? (
                    <FeedVideoPlayer post={currentPost} isPlaying={isPlaying} isMuted={isMuted} />
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentPost.mediaUrls?.[0] || currentPost.thumbnailUrl || ""}
                        alt={currentPost.caption}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </>
                  )}
                  {/* Decorative blur circles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
                  </div>
                </div>

                {/* Mute button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted((m) => !m); }}
                  className="touch-feedback absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

                {/* ── Bottom-left overlay (post info) ── */}
                <div className="absolute bottom-4 left-3 right-16 sm:right-20 z-10 space-y-2 sm:space-y-2.5 lg:bottom-6 lg:left-6">
                  {/* Creator info */}
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Link
                      href={`/profile/${currentPost.authorUsername}`}
                      onClick={(e) => e.stopPropagation()}
                      className="touch-feedback block"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] cursor-pointer" style={{ background: "linear-gradient(135deg, #7C2CFF, #FF2C91, #FF8A34)" }}>
                        {currentPost.authorAvatar && currentPost.authorAvatar.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={currentPost.authorAvatar} alt={currentPost.authorName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-vox-bg flex items-center justify-center text-xs font-bold text-white">
                            {currentPost.authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/profile/${currentPost.authorUsername}`}
                          onClick={(e) => e.stopPropagation()}
                          className="touch-feedback text-sm font-bold text-white truncate hover:underline"
                        >
                          {currentPost.authorName}
                        </Link>
                        {getAuthorAccount(currentPost.authorUsername)?.verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-vox-cyan flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-vox-muted truncate">
                        @{currentPost.authorUsername} · {timeAgo(currentPost.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFollowedCreators(prev => {
                          const s = new Set(prev);
                          if (s.has(currentPost.authorUsername)) { s.delete(currentPost.authorUsername); } else { s.add(currentPost.authorUsername); }
                          return s;
                        });
                      }}
                      className={`touch-feedback ml-1 flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all ${
                        followedCreators.has(currentPost.authorUsername) ? "text-vox-muted border border-white/10" : "text-white"
                      }`}
                      style={!followedCreators.has(currentPost.authorUsername) ? {
                        background: "linear-gradient(135deg, rgba(124,44,255,0.3), rgba(255,44,145,0.3))",
                        border: "1px solid rgba(255,255,255,0.2)",
                      } : undefined}
                    >
                      {followedCreators.has(currentPost.authorUsername) ? "Following" : (<><Plus className="w-3 h-3" />Follow</>)}
                    </button>
                  </div>

                  {/* Caption */}
                  {currentPost.caption && (
                    <p className="text-white/90 text-xs leading-relaxed break-words line-clamp-3">
                      {currentPost.caption}
                    </p>
                  )}

                  {/* Hashtags */}
                  {currentPost.hashtags && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentPost.hashtags.split(/[\s,]+/).filter(Boolean).map((tag, i) => (
                        <span
                          key={i}
                          onClick={(e) => { e.stopPropagation(); router.push("/explore"); }}
                          className="text-vox-cyan text-xs font-medium cursor-pointer hover:underline"
                        >
                          #{tag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sound / Music */}
                  <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[260px]">
                    <Music className="w-3.5 h-3.5 text-white/70 flex-shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="overflow-hidden flex-1">
                      <div className="animate-marquee whitespace-nowrap text-white/70 text-xs">
                        <span className="inline-block pr-8">Original Sound - {currentPost.authorName}</span>
                        <span className="inline-block pr-8">Original Sound - {currentPost.authorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right-side action buttons (Snapchat-style glassy circles) ── */}
                <div className="absolute right-2 sm:right-3 bottom-20 sm:bottom-16 z-10 flex flex-col items-center gap-2.5 sm:gap-3 lg:right-4 lg:bottom-1/4">
                  {/* Like */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLike(currentPost.id); }}
                    className="touch-feedback flex flex-col items-center gap-0.5"
                  >
                    <motion.div whileTap={{ scale: 1.4 }} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${likedPosts.has(currentPost.id) ? "fill-vox-pink text-vox-pink" : "text-white"}`} />
                    </motion.div>
                    <span className="text-[10px] font-semibold text-white drop-shadow-lg">{formatCount(currentPost.likes)}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCommentModal(true); }}
                    className="touch-feedback flex flex-col items-center gap-0.5"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-white drop-shadow-lg">{currentPost.comments?.length || 0}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(currentPost.id); }}
                    className="touch-feedback flex flex-col items-center gap-0.5"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-white drop-shadow-lg">{formatCount(currentPost.shares)}</span>
                  </button>

                  {/* Gift */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowGiftModal(true); }}
                    className="touch-feedback flex flex-col items-center gap-0.5"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-white drop-shadow-lg">Gift</span>
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(currentPost.id); }}
                    className="touch-feedback flex flex-col items-center gap-0.5"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${savedPosts.has(currentPost.id) ? "fill-vox-orange text-vox-orange" : "text-white"}`} />
                    </div>
                  </button>

                  {/* More */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu((s) => !s); }}
                      className="touch-feedback w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10"
                    >
                      <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                            <button onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }} className="touch-feedback w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.06] text-left">
                              <AlertCircle className="w-4 h-4 text-vox-muted" /> Report
                            </button>
                            <button onClick={() => { setShowMoreMenu(false); handleShare(currentPost.id); }} className="touch-feedback w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/[0.06] text-left">
                              <Copy className="w-4 h-4 text-vox-muted" /> Copy link
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Views count */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10">
                  <Eye className="w-3 h-3" />
                  {formatCount(currentPost.views)}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Progress bar ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/20">
              <motion.div
                key={currentPost.id}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7C2CFF, #FF2C91, #FF8A34)" }}
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "100%" : undefined }}
                transition={isPlaying ? { duration: 15, ease: "linear" } : { duration: 0 }}
              />
            </div>

            {/* ── Post index dots ── */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-1.5">
              {visiblePosts.slice(0, 10).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goToPost(i, i > safeIndex ? 1 : -1)}
                  className={`touch-feedback w-1.5 rounded-full transition-all duration-300 ${
                    i === safeIndex ? "h-6 bg-gradient-to-b from-vox-purple to-vox-pink" : "h-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT SIDEBAR (desktop lg+)
          ═══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[300px] flex-shrink-0 h-screen border-l border-white/[0.06] bg-vox-bg overflow-y-auto scrollbar-hide">
        <div className="h-12 flex items-center px-5 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-vox-muted uppercase tracking-wider">Discover</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 scrollbar-hide">
          {/* ── Trending ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Trending</h3>
              <button onClick={() => router.push("/explore")} className="touch-feedback text-xs text-vox-pink hover:underline">See all</button>
            </div>
            <div className="space-y-2">
              {trendingHashtags.map((item) => (
                <Link key={item.tag} href="/explore" className="touch-feedback flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-vox-purple/20 transition-colors">
                    <Hash className="w-4 h-4 text-vox-muted group-hover:text-vox-purple transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">#{item.tag}</p>
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
                <Link key={pill} href="/explore" className="touch-feedback text-xs font-medium text-vox-muted px-3 py-1.5 rounded-full border border-white/10 hover:border-vox-purple/50 hover:text-white hover:bg-vox-purple/10 transition-all">
                  {pill}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-vox-muted/60 leading-relaxed">
              About &middot; Terms &middot; Privacy &middot; Community Guidelines<br />
              &copy; 2025 VOXel
            </p>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          COMMENT MODAL
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCommentModal && currentPost && (
          <CommentModal
            post={currentPost}
            onClose={() => setShowCommentModal(false)}
            onUpdate={(postId, comment) =>
              setPosts(prev =>
                prev.map((p) =>
                  p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
                )
              )
            }
          />
        )}
      </AnimatePresence>

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
              className="glass-strong rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Send a Gift</h3>
                <button onClick={() => setShowGiftModal(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback">
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <p className="text-xs text-vox-muted mb-4">Your balance: {coinBalance} 🪙</p>
              <div className="grid grid-cols-3 gap-3">
                {giftOptions.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => handleSendGift(g)}
                    disabled={coinBalance < g.cost}
                    className="touch-feedback flex flex-col items-center gap-1 p-3 rounded-2xl glass hover:bg-white/[0.08] transition-colors disabled:opacity-40"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-[10px] text-white font-medium">{g.name}</span>
                    <span className="text-[10px] text-vox-orange">{g.cost}🪙</span>
                  </button>
                ))}
              </div>
              <button onClick={() => router.push("/wallet")} className="w-full mt-4 glass rounded-xl py-2.5 text-xs text-vox-muted touch-feedback">
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
                <h3 className="text-base font-bold text-white">Report Post</h3>
                <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback">
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                {reportReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm touch-feedback transition-colors ${
                      reportReason === r ? "btn-gradient text-white" : "glass text-vox-muted"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (reportReason) {
                    setShowReportModal(false);
                    setShowMoreMenu(false);
                    setReportReason(null);
                    showToast("Report submitted. Thank you.");
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
          TOAST
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
          INLINE STYLES
          ═══════════════════════════════════════════ */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 8s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
