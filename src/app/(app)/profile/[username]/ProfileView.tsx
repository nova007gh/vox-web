"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Lock,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  Grid3x3,
  Globe,
} from "lucide-react";
import { getAccount, profileToAccount, type Account } from "../../../../lib/accounts";
import UserPostsGrid from "../UserPostsGrid";
import { useAuth } from "@/lib/auth-context";
import {
  getUserPosts,
  formatCount,
  type Post,
} from "@/lib/content-store";
import {
  subscribeToUserPosts,
  getUserByUsername,
  getFollowing as getFollowingFS,
  getFollowers as getFollowersFS,
  toggleFollow as toggleFollowFS,
  isFollowing as isFollowingFS,
  addNotification as addNotificationFS,
} from "@/lib/firebase-store";

/* ─────────────── Page Props ─────────────── */
interface ProfileViewProps {
  username: string;
}

/* ─────────────── Page ─────────────── */
export default function ProfileView({ username }: ProfileViewProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [account, setAccount] = useState<Account | null>(getAccount(username) || null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  /* ── Load account from Firebase (cross-device) ── */
  useEffect(() => {
    let cancelled = false;
    const local = getAccount(username);
    if (local) setAccount(local);
    getUserByUsername(username).then((profile) => {
      if (cancelled) return;
      if (profile) setAccount(profileToAccount(profile));
      setLoadingAccount(false);
    });
    return () => { cancelled = true; };
  }, [username]);

  /* ── Follow state from Firestore (cross-device) ── */
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = currentUser?.username === username;

  /* ── State ── */
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(() => getUserPosts(username));
  const [postCount, setPostCount] = useState(posts.length);

  /* ── Effects ── */
  useEffect(() => {
    const initial = getUserPosts(username);
    setPosts(initial);
    const unsubscribe = subscribeToUserPosts(username, (newPosts) =>
      setPosts(newPosts)
    );
    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    setPostCount(posts.length);
  }, [posts]);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      const [fsFollowers, fsFollowing, fsIsFollowing] = await Promise.all([
        getFollowersFS(username),
        getFollowingFS(username),
        currentUser ? isFollowingFS(currentUser.username, username) : false,
      ]);
      if (cancelled) return;
      setFollowersCount(fsFollowers.length);
      setFollowingCount(fsFollowing.length);
      setFollowing(fsIsFollowing);
    })();
    return () => { cancelled = true; };
  }, [username, currentUser, account]);

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

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile || !account) return;
    const newState = await toggleFollowFS(currentUser.username, username);
    setFollowing(newState);
    setFollowersCount((prev) => (newState ? prev + 1 : Math.max(0, prev - 1)));
    setFollowingCount(await getFollowingFS(currentUser.username).then((f) => f.length));
    showToast(
      newState ? `Now following ${account.name}` : `Unfollowed ${account.name}`
    );
    if (newState) {
      addNotificationFS(username, {
        type: "follow",
        fromUsername: currentUser.username,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatar || "",
        message: "started following you",
      });
    }
  };

  const handleMessage = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("voxel_open_chat", username);
    }
    router.push("/messages");
  };

  /* ── Not Found ── */
  if (loadingAccount) {
    return (
      <div className="min-h-screen vox-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-10 h-10 border-4 border-vox-purple/30 border-t-vox-purple rounded-full animate-spin" />
        <p className="text-vox-muted mt-4">Loading profile...</p>
      </div>
    );
  }

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
    { label: "Posts", value: formatCount(postCount) },
    { label: "Followers", value: formatCount(followersCount) },
    { label: "Following", value: formatCount(followingCount) },
  ];

  /* ── Render ── */
  return (
    <div className="min-h-screen vox-bg pb-20">
      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-vox-bg/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm truncate max-w-[150px] sm:max-w-[180px]">
            @{account.username}
          </span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast("More options coming soon")}
              className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition"
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
            disabled={isOwnProfile || !currentUser}
            className={`flex-1 py-3 rounded-full font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOwnProfile
                ? "glass text-vox-muted"
                : following
                ? "glass text-white hover:bg-white/10"
                : "btn-gradient text-white"
            }`}
          >
            {isOwnProfile ? "You" : following ? "Following" : "Follow"}
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
              disabled={isOwnProfile || !currentUser}
              className={`px-8 py-3 rounded-full font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isOwnProfile
                  ? "glass text-vox-muted"
                  : following
                  ? "glass text-white hover:bg-white/10"
                  : "btn-gradient text-white"
              }`}
            >
              {isOwnProfile ? "You" : following ? "Following" : "Follow"}
            </button>
          </motion.div>
        ) : (
          /* Posts grid */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Grid3x3 className="w-4 h-4 text-vox-muted" />
              <h2 className="text-white font-semibold text-sm">
                Posts ({postCount})
              </h2>
            </div>

            <UserPostsGrid
              username={account.username}
              emptyMessage="No posts yet"
            />
          </div>
        )}
      </div>

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
