"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Lock,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  Heart,
  Grid3x3,
  Globe,
  Play,
} from "lucide-react";
import {
  getAccount,
} from "../../../../lib/accounts";
import UserPostsGrid from "../UserPostsGrid";

/* ─────────────── Page Props ─────────────── */
interface ProfileViewProps {
  username: string;
}

/* ─────────────── Page ─────────────── */
export default function ProfileView({ username }: ProfileViewProps) {
  const router = useRouter();
  const account = getAccount(username);

  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<
    | {
        id: number;
        caption: string;
        likes: string;
        comments: string;
        thumbnail: string;
      }
    | null
  >(null);

  /* ── Helpers ── */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${account?.name} on VOXel`,
          text: `Check out ${account?.name} on VOXel!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Profile link copied!");
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    showToast(
      isFollowing ? `Unfollowed ${account?.name}` : `Now following ${account?.name}`
    );
  };

  const handleMessage = () => {
    router.push("/messages");
  };

  /* ── Not Found ── */
  if (!account) {
    return (
      <div className="min-h-screen vox-bg flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 max-w-md w-full"
        >
          <div className="w-20 h-20 rounded-full bg-vox-purple/20 flex items-center justify-center mx-auto mb-6">
            <MoreHorizontal className="w-10 h-10 text-vox-purple" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Profile not found</h1>
          <p className="text-vox-muted mb-8">
            The profile <span className="text-white">@{username}</span> doesn&apos;t
            exist or may have been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="btn-gradient px-6 py-3 rounded-full text-white font-semibold inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: "Posts", value: account.posts_count },
    { label: "Followers", value: account.followers },
    { label: "Following", value: account.following },
  ];

  /* ── Render ── */
  return (
    <div className="min-h-screen vox-bg pb-20">
      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-vox-bg/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm truncate max-w-[180px]">
            @{account.username}
          </span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-14 glass rounded-2xl p-2 w-48 z-50"
            >
              <button
                onClick={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
              >
                <Share2 className="w-4 h-4 text-vox-cyan" />
                Share Profile
              </button>
              <button
                onClick={() => {
                  showToast("Profile reported");
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
              >
                <MoreHorizontal className="w-4 h-4 text-vox-pink" />
                Report
              </button>
              <button
                onClick={() => {
                  showToast("Blocked " + account.name);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
              >
                <Lock className="w-4 h-4 text-vox-danger" />
                Block
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Cover ── */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        <img
          src={account.cover}
          alt={`${account.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vox-bg/30 to-vox-bg" />
      </div>

      {/* ── Profile Header ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-4">
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-vox-purple via-vox-pink to-vox-cyan">
            <div className="p-[2px] rounded-full bg-vox-bg">
              <img
                src={account.avatar}
                alt={account.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast("More options coming soon")}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
              aria-label="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name + verified */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white">{account.name}</h1>
          {account.verified && (
            <BadgeCheck className="w-5 h-5 text-vox-cyan flex-shrink-0" />
          )}
        </div>

        {/* Username + category + flag */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-vox-muted text-sm">@{account.username}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-vox-purple/15 border border-vox-purple/30 text-vox-purple text-xs font-medium">
            {account.category}
          </span>
          <span className="text-sm" title={account.country}>
            {account.flag}
          </span>
        </div>

        {/* Bio */}
        {account.bio && (
          <p className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-line">
            {account.bio}
          </p>
        )}

        {/* Link */}
        {account.link && (
          <a
            href={account.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-vox-cyan text-sm font-medium hover:underline mb-4"
          >
            <Globe className="w-4 h-4" />
            {account.linkLabel || account.link}
          </a>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl py-3 px-2 text-center"
            >
              <div className="text-white font-bold text-lg">{s.value}</div>
              <div className="text-vox-muted text-xs uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleFollow}
            className={`flex-1 py-3 rounded-full font-semibold text-sm transition flex items-center justify-center gap-2 ${
              isFollowing
                ? "glass text-white hover:bg-white/10"
                : "btn-gradient text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button
            onClick={handleMessage}
            className="flex-1 py-3 rounded-full font-semibold text-sm glass text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4">
        {account.isPrivate ? (
          /* Private profile notice */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-vox-purple/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-vox-purple" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">
              This Profile is Private
            </h2>
            <p className="text-vox-muted text-sm mb-6 max-w-xs mx-auto">
              Follow {account.name} to see their photos and videos.
            </p>
            <button
              onClick={handleFollow}
              className={`px-8 py-3 rounded-full font-semibold text-sm transition ${
                isFollowing
                  ? "glass text-white hover:bg-white/10"
                  : "btn-gradient text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </motion.div>
        ) : (
          /* Posts grid */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Grid3x3 className="w-4 h-4 text-vox-muted" />
              <h2 className="text-white font-semibold text-sm">
                Posts ({account.posts.length})
              </h2>
            </div>

            {/* User uploaded posts from content store */}
            <UserPostsGrid
              username={account.username}
              emptyMessage=""
            />

            {/* Seeded posts */}
            {account.posts.length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center">
                <p className="text-vox-muted text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {account.posts.map((post, idx) => (
                  <motion.button
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden group"
                  >
                    <img
                      src={post.thumbnail}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1 text-white text-xs font-medium">
                        <Heart className="w-3 h-3 fill-vox-pink text-vox-pink" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-white text-xs font-medium">
                        <MessageCircle className="w-3 h-3 text-vox-cyan" />
                        {post.comments}
                      </span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Post Modal ── */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl overflow-hidden max-w-sm w-full"
            >
              <div className="relative">
                <img
                  src={selectedPost.thumbnail}
                  alt={selectedPost.caption}
                  className="w-full aspect-[3/4] object-cover"
                />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition"
                  aria-label="Close"
                >
                  <ChevronLeft className="w-5 h-5 rotate-90" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm font-semibold truncate">
                        {account.name}
                      </span>
                      {account.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-vox-cyan flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-vox-muted text-xs">
                      @{account.username}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {selectedPost.caption}
                </p>
                <div className="flex items-center gap-5 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-white text-sm">
                    <Heart className="w-4 h-4 text-vox-pink fill-vox-pink" />
                    {selectedPost.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-white text-sm">
                    <MessageCircle className="w-4 h-4 text-vox-cyan" />
                    {selectedPost.comments}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 glass rounded-full px-5 py-3 text-white text-sm font-medium shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-vox-green" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
