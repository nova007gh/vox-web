"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import UserPostsGrid from "./UserPostsGrid";
import { compressImageForFirestore, getUserPosts, getFollowing, formatCount } from "@/lib/content-store";
import { uploadFile, subscribeToUserPosts } from "@/lib/firebase-store";
import {
  BadgeCheck,
  Flame,
  Crown,
  Heart,
  MessageCircle,
  Gift,
  Share2,
  MoreHorizontal,
  Play,
  Bookmark,
  ShoppingBag,
  Info,
  BarChart3,
  DollarSign,
  Users,
  Music,
  Copyright,
  ShieldCheck,
  Shield,
  FileText,
  Star,
  Award,
  TrendingUp,
  Gavel,
  Lock,
  LogOut,
  Settings,
  HelpCircle,
  Pencil,
  MapPin,
  Link2,
  ChevronLeft,
  ChevronDown,
  X,
  Check,
  Camera,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */

const defaultStats = [
  { label: "Posts", value: "0" },
  { label: "Followers", value: "0" },
  { label: "Following", value: "0" },
  { label: "Trust Score", value: "—" },
];

const creatorHub = [
  { label: "Analytics", icon: BarChart3, color: "text-vox-cyan", bg: "bg-vox-cyan/15", action: "analytics" },
  { label: "Earnings", icon: DollarSign, color: "text-vox-green", bg: "bg-vox-green/15", action: "/wallet" },
  { label: "Subscriptions", icon: Users, color: "text-vox-purple", bg: "bg-vox-purple/15", action: "subscriptions" },
  { label: "Gifts", icon: Gift, color: "text-vox-pink", bg: "bg-vox-pink/15", action: "/wallet" },
  { label: "Shop", icon: ShoppingBag, color: "text-vox-orange", bg: "bg-vox-orange/15", action: "/marketplace" },
  { label: "Auctions", icon: Gavel, color: "text-vox-warning", bg: "bg-vox-warning/15", action: "/live" },
  { label: "Music", icon: Music, color: "text-fuchsia-400", bg: "bg-fuchsia-400/15", action: "/explore" },
  { label: "Copyright", icon: Copyright, color: "text-vox-cyan", bg: "bg-vox-cyan/15", action: "copyright" },
  { label: "Protection", icon: Lock, color: "text-vox-danger", bg: "bg-vox-danger/15", action: "protection" },
];

const badges = [
  { label: "Verified", icon: BadgeCheck, color: "text-vox-cyan", bg: "bg-vox-cyan/15", border: "border-vox-cyan/20", desc: "Identity verified by VOXel" },
  { label: "Popular", icon: Flame, color: "text-vox-orange", bg: "bg-vox-orange/15", border: "border-vox-orange/20", desc: "Over 500K followers" },
  { label: "Elite", icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/15", border: "border-yellow-400/20", desc: "Top 1% creator" },
  { label: "Trusted Seller", icon: ShieldCheck, color: "text-vox-green", bg: "bg-vox-green/15", border: "border-vox-green/20", desc: "Verified seller with escrow" },
  { label: "Premium", icon: Star, color: "text-vox-purple", bg: "bg-vox-purple/15", border: "border-vox-purple/20", desc: "Premium subscriber" },
];

const suggestedCreators = [
  { id: 1, name: "SNY Obeng", handle: "@snyobeng", username: "snyobeng", avatar: "/profiles/snyobeng/123121.jpeg" },
  { id: 2, name: "Glow By Nana", handle: "@glowbynana", username: "glowbynana", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 3, name: "Berry Beauty", handle: "@berrybeauty", username: "berrybeauty", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 4, name: "Hair By Maame", handle: "@hairbymaame", username: "hairbymaame", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 5, name: "Wigs By Akua", handle: "@wigsbyakua", username: "wigsbyakua", avatar: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 6, name: "Afro Queen", handle: "@afroqueen", username: "afroqueen", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 7, name: "Slayed By Esi", handle: "@slayedbyesi", username: "slayedbyesi", avatar: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
];

const faqs = [
  { q: "How do I become a verified creator?", a: "Reach 10K followers, complete identity verification, and maintain a Trust Score above 4.0 to apply for the verified badge." },
  { q: "How do I withdraw my earnings?", a: "Go to Earnings in the Creator Hub, link your mobile money or bank account, and request a withdrawal. Funds arrive within 1-3 business days." },
  { q: "What is the Trust Score?", a: "Your Trust Score reflects account authenticity, engagement quality, and community standing. It updates based on your activity and feedback." },
  { q: "How do I report inappropriate content?", a: "Tap the three dots on any video or profile and select Report. Our moderation team reviews reports within 24 hours." },
  { q: "Can I sell products on VOXel?", a: "Yes! Verified sellers can list products in the Marketplace with escrow-protected transactions for buyer and seller safety." },
];

const weeklyViews = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout, hydrated, updateProfile } = useAuth();

  // Redirect to auth if not logged in (wait for hydration to avoid redirect loop)
  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [hydrated, currentUser, router]);

  const [activeTab, setActiveTab] = useState("Videos");
  const [showMenu, setShowMenu] = useState(false);
  const [followedSuggested, setFollowedSuggested] = useState<Set<number>>(new Set());
  const [expandedBadge, setExpandedBadge] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Editable profile data - derived from current logged-in user
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "Guest",
    username: currentUser?.username || "guest",
    bio: currentUser?.bio || "",
    location: currentUser?.country || "",
  });
  const [editForm, setEditForm] = useState(profileData);

  // Update profile data when user changes (e.g., after login)
  useEffect(() => {
    if (currentUser) {
      const newData = {
        name: currentUser.name,
        username: currentUser.username,
        bio: currentUser.bio,
        location: currentUser.country,
      };
      setProfileData(newData);
      setEditForm(newData);
    }
  }, [currentUser]);

  // Real stats from current user
  const [realPostCount, setRealPostCount] = useState(0);
  const [realFollowing, setRealFollowing] = useState(0);
  const [realFollowers, setRealFollowers] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const username = currentUser.username;
    // Real post count
    setRealPostCount(getUserPosts(username).length);
    const unsub = subscribeToUserPosts(username, (posts) => setRealPostCount(posts.length));
    // Real following count
    const followsByUser = typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("voxel_follows_by_user") || "{}")
      : {};
    setRealFollowing((followsByUser[username] || getFollowing()).length);
    // Real followers count
    let fCount = 0;
    for (const u in followsByUser) {
      if (followsByUser[u].includes(username)) fCount++;
    }
    setRealFollowers(fCount);
    return () => unsub();
  }, [currentUser]);

  const stats = currentUser
    ? [
        { label: "Posts", value: formatCount(realPostCount) },
        { label: "Followers", value: formatCount(realFollowers) },
        { label: "Following", value: formatCount(realFollowing) },
        { label: "Trust Score", value: realPostCount > 0 ? "4.9" : "—" },
      ]
    : defaultStats;

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Cover/banner upload
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressImageForFirestore(file, 200000);
      const { url } = await uploadFile(compressed, `avatars/${currentUser.username}_${Date.now()}.jpg`);
      setAvatarPreview(url);
      updateProfile({ avatar: url });
      showToast("Profile picture updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast("Failed to upload image");
    }
    setUploadingAvatar(false);
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setUploadingCover(true);
    try {
      const compressed = await compressImageForFirestore(file, 500000);
      const { url } = await uploadFile(compressed, `covers/${currentUser.username}_${Date.now()}.jpg`);
      setCoverPreview(url);
      updateProfile({ cover: url });
      showToast("Banner updated!");
    } catch (err) {
      console.error("Cover upload error:", err);
      showToast("Failed to upload banner");
    }
    setUploadingCover(false);
  };

  // Content tabs - use real post count
  const contentTabs = [
    { label: "Videos", icon: Play, count: realPostCount },
    { label: "Liked", icon: Heart, count: 0 },
    { label: "Saved", icon: Bookmark, count: 0 },
    { label: "Shop", icon: ShoppingBag, count: 0 },
    { label: "About", icon: Info, count: null },
  ];

  // Settings
  const [settings, setSettings] = useState({
    pushNotif: true,
    emailNotif: false,
    dmLevel: "Everyone" as "Everyone" | "Friends" | "Off",
    privacy: "Public" as "Public" | "Private",
    darkMode: true,
    language: "English",
  });

  // FAQ expansion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${profileData.name} on VOXel`, text: `Check out ${profileData.name} on VOXel!`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Profile link copied!");
    }
  };

  const handleCreatorHub = (action: string) => {
    if (action.startsWith("/")) {
      router.push(action);
    } else if (action === "analytics") {
      setShowAnalyticsModal(true);
    } else if (action === "subscriptions") {
      setShowSubsModal(true);
    } else if (action === "copyright") {
      setShowCopyrightModal(true);
    } else if (action === "protection") {
      setShowProtectionModal(true);
    }
  };

  const toggleSuggestedFollow = (id: number) => {
    setFollowedSuggested((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const openEdit = () => {
    setEditForm(profileData);
    setShowEditModal(true);
  };

  const saveProfile = () => {
    setProfileData(editForm);
    // Persist to auth context
    updateProfile({
      name: editForm.name,
      username: editForm.username,
      bio: editForm.bio,
      country: editForm.location,
    });
    showToast("Profile updated!");
    setShowEditModal(false);
  };

  const saveSettings = () => {
    showToast("Settings saved!");
    setShowSettingsModal(false);
  };

  const menuItems = [
    { label: "Edit Profile", icon: Pencil, action: () => openEdit() },
    { label: "Settings", icon: Settings, action: () => setShowSettingsModal(true) },
    { label: "Help & Support", icon: HelpCircle, action: () => setShowHelpModal(true) },
    { label: "Log Out", icon: LogOut, action: () => { logout(); router.push("/auth"); } },
  ];

  // Show loading state while auth is hydrating
  if (!hydrated) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  // If still no user after hydration, the redirect effect will handle it
  if (!currentUser) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-20 lg:pb-0" style={{ paddingBottom: "calc(5rem + var(--safe-bottom, 0px))" }}>
      {/* ═══════ COVER AREA ═══════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative">
        <div className="h-36 sm:h-44 md:h-56 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPreview || currentUser?.cover || "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=1200&h=400&auto=format&fit=crop"} alt="Profile cover image" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-vox-purple/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-vox-pink/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-vox-orange/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-vox-bg via-transparent to-transparent" />
          {/* Back button overlay */}
          <button
            onClick={() => router.back()}
            className="absolute w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-white z-10"
            style={{ top: "var(--safe-top)", left: "12px" }}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {/* Change cover button */}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-white z-10 disabled:opacity-60"
            style={{ top: "var(--safe-top)", right: "52px" }}
            aria-label="Change banner"
          >
            {uploadingCover ? (
              <div className="w-4 h-4 rounded-full border border-white/30 border-t-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          {/* Settings/Share button overlay */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-white z-10"
            style={{ top: "var(--safe-top)", right: "12px" }}
            aria-label="More options"
          >
            <Settings className="w-4 h-4" />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 -mt-12 sm:-mt-16 pb-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-br from-vox-purple via-vox-pink to-vox-orange">
                <div className="w-full h-full rounded-full bg-vox-bg overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentUser?.avatar || "/profiles/justwearwigs/avatar.jpeg"} alt={`${profileData.name} profile avatar`} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-vox-green border-[3px] border-vox-bg" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{profileData.name}</h1>
                <BadgeCheck className="w-5 h-5 text-vox-cyan" />
                <Flame className="w-5 h-5 text-vox-orange" />
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-sm text-vox-muted">@{profileData.username}</span>
                <span className="text-[10px] font-semibold text-vox-purple bg-vox-purple/15 px-2 py-0.5 rounded-full">Creator</span>
                <span className="text-sm">🇬🇭</span>
              </div>
              <p className="text-sm text-vox-muted mt-2 max-w-md mx-auto sm:mx-0">
                {profileData.bio}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl py-2.5 px-2 touch-feedback card-hover text-center">
                <p className="text-base sm:text-lg md:text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] sm:text-[11px] text-vox-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="flex items-center justify-center sm:justify-start gap-2 mt-5 flex-wrap">
            <button
              onClick={openEdit}
              className="btn-gradient rounded-full px-5 py-2 text-xs sm:text-sm font-semibold touch-feedback text-white"
            >
              Edit Profile
            </button>
            <button onClick={() => router.push("/messages")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button onClick={() => router.push("/wallet")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-colors">
              <Gift className="w-5 h-5" />
            </button>
            <button onClick={handleShare} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 z-50 glass-strong rounded-2xl p-2 min-w-[160px] sm:min-w-[180px] shadow-2xl"
                  >
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { item.action(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl touch-feedback text-sm text-vox-muted hover:text-white transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════ CONTENT AREA ═══════ */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* ── CONTENT TABS ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className="border-b border-white/[0.06] mb-5">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {contentTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium shrink-0 touch-feedback transition-colors ${activeTab === tab.label ? "text-white" : "text-vox-muted hover:text-white"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && <span className="text-[10px] text-vox-muted ml-0.5">({tab.count})</span>}
                {activeTab === tab.label && (
                  <motion.div layoutId="profile-tab-active" className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-vox-purple to-vox-pink rounded-full" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── VIDEOS TAB ── */}
        {activeTab === "Videos" && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* User uploaded posts */}
            <UserPostsGrid
              username={currentUser?.username || ""}
              emptyMessage="No posts yet. Tap Create to share your first post!"
            />
          </motion.section>
        )}

        {/* ── LIKED TAB ── */}
        {activeTab === "Liked" && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass rounded-3xl p-10 text-center">
              <Heart className="w-12 h-12 text-vox-muted mx-auto mb-3" />
              <p className="text-vox-muted text-sm">No liked posts yet. Tap the heart on posts you enjoy!</p>
            </div>
          </motion.section>
        )}

        {/* ── SAVED TAB ── */}
        {activeTab === "Saved" && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass rounded-3xl p-10 text-center">
              <Bookmark className="w-12 h-12 text-vox-muted mx-auto mb-3" />
              <p className="text-vox-muted text-sm">No saved posts yet. Tap the bookmark on posts to save them!</p>
            </div>
          </motion.section>
        )}

        {/* ── SHOP TAB ── */}
        {activeTab === "Shop" && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-vox-muted mx-auto mb-3" />
              <p className="text-vox-muted text-sm mb-4">No products in your shop yet</p>
              <button onClick={() => router.push("/marketplace")} className="btn-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-xl touch-feedback">
                Visit Marketplace
              </button>
            </div>
          </motion.section>
        )}

        {/* ── ABOUT TAB ── */}
        {activeTab === "About" && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Bio</h3>
                <p className="text-sm text-vox-muted">{profileData.bio || "No bio yet."}</p>
              </div>
              {profileData.location && (
                <div className="flex items-center gap-2 text-sm text-vox-muted">
                  <MapPin className="w-4 h-4 text-vox-pink" />
                  {profileData.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-vox-muted">
                <Link2 className="w-4 h-4 text-vox-cyan" />
                vox.el/{profileData.username}
              </div>
            </div>
          </motion.section>
        )}

        {/* ── CREATOR HUB ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-vox-orange" />
            <h2 className="text-lg font-bold text-white">Creator Hub</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {creatorHub.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
                onClick={() => handleCreatorHub(item.action)}
                className="glass rounded-2xl p-3 flex flex-col items-center gap-2 touch-feedback card-hover group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-[11px] font-medium text-vox-muted group-hover:text-white transition-colors">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── BADGES ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-vox-pink" />
            <h2 className="text-lg font-bold text-white">Badges</h2>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
                onClick={() => setExpandedBadge(expandedBadge === i ? null : i)}
                className={`shrink-0 glass rounded-2xl p-3.5 flex items-center gap-2.5 touch-feedback card-hover border ${badge.border} cursor-pointer relative`}
              >
                <div className={`w-9 h-9 rounded-xl ${badge.bg} flex items-center justify-center`}>
                  <badge.icon className={`w-4.5 h-4.5 ${badge.color}`} />
                </div>
                <span className="text-xs font-semibold text-white pr-2">{badge.label}</span>
                <AnimatePresence>
                  {expandedBadge === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 z-20 glass rounded-xl p-3 min-w-[200px] shadow-2xl"
                    >
                      <p className="text-xs text-white font-medium mb-1">{badge.label}</p>
                      <p className="text-[11px] text-vox-muted">{badge.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── SUGGESTED CREATORS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-vox-purple" />
              <h2 className="text-lg font-bold text-white">Suggested Creators</h2>
            </div>
            <button onClick={() => router.push("/explore")} className="text-xs font-medium text-vox-cyan hover:text-white transition-colors touch-feedback">
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
            {suggestedCreators.map((creator) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.username}`}
                className="w-28 sm:w-32 shrink-0 glass rounded-2xl p-4 flex flex-col items-center gap-2 touch-feedback card-hover group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-vox-pink/40 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt={`${creator.name} avatar`} className="w-full h-full object-cover" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-semibold text-white truncate w-full text-center">{creator.name}</p>
                  <p className="text-[10px] text-vox-muted truncate w-full text-center">{creator.handle}</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleSuggestedFollow(creator.id); }}
                  className={`text-[10px] font-semibold px-4 py-1.5 rounded-xl w-full touch-feedback transition-all ${
                    followedSuggested.has(creator.id) ? "glass text-vox-muted" : "btn-gradient text-white"
                  }`}
                >
                  {followedSuggested.has(creator.id) ? "Following" : "Follow"}
                </button>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 z-[60] glass-strong rounded-full px-5 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ EDIT PROFILE MODAL ═══════ */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-col items-center gap-3 pb-2">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarPreview || currentUser?.avatar || "/profiles/justwearwigs/avatar.jpeg"}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-vox-purple/40"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full btn-gradient flex items-center justify-center touch-feedback disabled:opacity-60"
                    >
                      {uploadingAvatar ? (
                        <div className="w-3.5 h-3.5 rounded-full border border-white/30 border-t-white animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-vox-muted">Tap camera to change photo</p>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>
                {[
                  { label: "Name", key: "name", placeholder: "Your name" },
                  { label: "Username", key: "username", placeholder: "@username" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-vox-muted block mb-1.5">{f.label}</label>
                    <input
                      value={editForm[f.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-vox-purple/50"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-vox-muted block mb-1.5">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-vox-purple/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-vox-muted block mb-1.5">Location</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-vox-purple/50"
                    placeholder="Your location"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ SETTINGS MODAL ═══════ */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-1">
                <div
                  className="flex items-center justify-between glass rounded-2xl px-4 py-3.5 touch-feedback cursor-pointer"
                  onClick={() => setSettings((p) => ({ ...p, pushNotif: !p.pushNotif }))}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Push Notifications</p>
                    <p className="text-xs text-vox-muted">Get notified of new activity</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.pushNotif ? "bg-vox-green" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.pushNotif ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between glass rounded-2xl px-4 py-3.5 touch-feedback cursor-pointer"
                  onClick={() => setSettings((p) => ({ ...p, emailNotif: !p.emailNotif }))}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Email Notifications</p>
                    <p className="text-xs text-vox-muted">Receive updates via email</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.emailNotif ? "bg-vox-green" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.emailNotif ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between glass rounded-2xl px-4 py-3.5 touch-feedback cursor-pointer"
                  onClick={() => setSettings((p) => ({ ...p, privacy: p.privacy === "Public" ? "Private" : "Public" }))}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Private Account</p>
                    <p className="text-xs text-vox-muted">Only followers can see your content</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.privacy === "Private" ? "bg-vox-green" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.privacy === "Private" ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between glass rounded-2xl px-4 py-3.5 touch-feedback cursor-pointer"
                  onClick={() => setSettings((p) => ({ ...p, dmLevel: p.dmLevel === "Everyone" ? "Friends" : "Everyone" }))}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Direct Messages</p>
                    <p className="text-xs text-vox-muted">Allow messages from everyone</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings.dmLevel === "Everyone" ? "bg-vox-green" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.dmLevel === "Everyone" ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between glass rounded-2xl px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-vox-muted">Always on</p>
                  </div>
                  <div className="w-11 h-6 rounded-full bg-vox-green relative">
                    <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </div>
                <button
                  onClick={saveSettings}
                  className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback mt-4"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => { setShowSettingsModal(false); logout(); router.push("/auth"); }}
                  className="w-full glass rounded-2xl py-3 text-sm font-semibold text-vox-danger touch-feedback"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HELP & SUPPORT MODAL ═══════ */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Help &amp; Support</h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="text-sm font-semibold text-vox-muted uppercase tracking-wide">FAQ</h4>
                {faqs.map((faq, i) => (
                  <div key={i} className="glass rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 touch-feedback"
                    >
                      <span className="text-sm font-medium text-white text-left">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-vox-muted shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-3.5">
                        <p className="text-sm text-vox-muted">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => { setShowHelpModal(false); showToast("Support request sent! We'll respond within 24h."); }}
                    className="w-full glass rounded-2xl py-3 text-sm font-semibold text-white touch-feedback"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => { setShowHelpModal(false); showToast("Bug report submitted. Thank you!"); }}
                    className="w-full glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                  >
                    Report a Bug
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => { setShowHelpModal(false); setShowTermsModal(true); }}
                      className="glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                    >
                      Terms of Service
                    </button>
                    <button
                      onClick={() => { setShowHelpModal(false); setShowPrivacyModal(true); }}
                      className="glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TERMS MODAL ═══════ */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Terms of Service</h3>
                <button onClick={() => setShowTermsModal(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"><X className="w-4 h-4 text-vox-muted" /></button>
              </div>
              <div className="p-5 space-y-3 text-sm text-vox-muted leading-relaxed">
                <p>Welcome to VOXel. By using our platform, you agree to these terms:</p>
                <p><span className="text-white font-semibold">1. Eligibility:</span> You must be at least 13 years old to use VOXel.</p>
                <p><span className="text-white font-semibold">2. Content:</span> You retain ownership of your content. You grant VOXel a license to display it on the platform.</p>
                <p><span className="text-white font-semibold">3. Conduct:</span> No harassment, hate speech, or illegal content. Violations may result in account termination.</p>
                <p><span className="text-white font-semibold">4. Payments:</span> VOX Coins are a virtual currency with no cash value unless redeemed through approved methods.</p>
                <p><span className="text-white font-semibold">5. Liability:</span> VOXel is provided &quot;as is&quot; without warranties. We are not liable for indirect damages.</p>
                <p className="text-xs pt-2">Last updated: August 2026. Questions? Contact legal@voxel.app</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PRIVACY MODAL ═══════ */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Privacy Policy</h3>
                <button onClick={() => setShowPrivacyModal(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"><X className="w-4 h-4 text-vox-muted" /></button>
              </div>
              <div className="p-5 space-y-3 text-sm text-vox-muted leading-relaxed">
                <p>Your privacy matters to us. Here&apos;s how we handle your data:</p>
                <p><span className="text-white font-semibold">1. Data Collection:</span> We collect account info, usage data, and content you upload.</p>
                <p><span className="text-white font-semibold">2. Sharing:</span> We never sell your data. We share only with service providers under strict agreements.</p>
                <p><span className="text-white font-semibold">3. Cookies:</span> We use cookies for authentication and personalization.</p>
                <p><span className="text-white font-semibold">4. Your Rights:</span> You can request data export or deletion anytime via Settings.</p>
                <p><span className="text-white font-semibold">5. Security:</span> We use encryption and 2FA to protect your account.</p>
                <p className="text-xs pt-2">Last updated: August 2026. Questions? Contact privacy@voxel.app</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ ANALYTICS MODAL ═══════ */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowAnalyticsModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Analytics</h3>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Views", value: formatCount(realPostCount > 0 ? 0 : 0), change: "—", color: "text-vox-cyan" },
                    { label: "Profile Visits", value: "0", change: "—", color: "text-vox-purple" },
                    { label: "Engagement", value: "0%", change: "—", color: "text-vox-green" },
                    { label: "Revenue", value: "$0", change: "—", color: "text-vox-orange" },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-2xl p-3">
                      <p className="text-[10px] text-vox-muted">{s.label}</p>
                      <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
                      <p className={`text-xs font-semibold ${s.color}`}>{s.change} this week</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Weekly Views</h4>
                  <div className="flex items-end gap-2 h-24">
                    {weeklyViews.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg btn-gradient" style={{ height: `${item.value}%` }} />
                        <span className="text-[9px] text-vox-muted">{item.day.charAt(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Top Videos</h4>
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-vox-muted text-xs">No video data yet. Start posting to see analytics!</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAnalyticsModal(false); showToast("Analytics exported!"); }}
                  className="w-full glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                >
                  Export Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ SUBSCRIPTIONS MODAL ═══════ */}
      <AnimatePresence>
        {showSubsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowSubsModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Subscriptions</h3>
                <button
                  onClick={() => setShowSubsModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">₵0</p>
                  <p className="text-xs text-vox-muted mt-1">Total monthly earnings</p>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                  <Users className="w-10 h-10 text-vox-muted mx-auto mb-2" />
                  <p className="text-vox-muted text-sm">No subscribers yet. Create engaging content to attract subscribers!</p>
                </div>
                <button
                  onClick={() => { setShowSubsModal(false); showToast("Subscription tiers updated!"); }}
                  className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback"
                >
                  Manage Tiers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ COPYRIGHT MODAL ═══════ */}
      <AnimatePresence>
        {showCopyrightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowCopyrightModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Copyright</h3>
                <button
                  onClick={() => setShowCopyrightModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="glass rounded-2xl p-4 flex items-start gap-3">
                  <Copyright className="w-8 h-8 text-vox-cyan shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Content Protection</p>
                    <p className="text-xs text-vox-muted">
                      Your content is protected under VOXel&apos;s intellectual property policy. All uploads are watermarked and tracked.
                    </p>
                  </div>
                </div>
                {[
                  { label: "My Content", desc: `${realPostCount} posts protected`, icon: Shield, color: "text-vox-cyan" },
                  { label: "Claims Received", desc: "0 active claims", icon: FileText, color: "text-vox-green" },
                  { label: "Claims Sent", desc: "0 submitted", icon: FileText, color: "text-vox-purple" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-vox-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setShowCopyrightModal(false); showToast("Feature available for verified creators"); }}
                  className="w-full glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                >
                  Submit a Claim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PROTECTION MODAL ═══════ */}
      <AnimatePresence>
        {showProtectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowProtectionModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 glass-strong flex items-center justify-between px-5 py-4 rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Account Protection</h3>
                <button
                  onClick={() => setShowProtectionModal(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="glass rounded-2xl p-4 flex items-start gap-3">
                  <Shield className="w-8 h-8 text-vox-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Account Secured</p>
                    <p className="text-xs text-vox-muted">
                      Your account is protected with two-factor authentication and advanced security monitoring.
                    </p>
                  </div>
                </div>
                {[
                  { label: "Two-Factor Auth", desc: "Enabled via SMS", icon: ShieldCheck, color: "text-vox-green" },
                  { label: "Login Alerts", desc: "Email & push notifications", icon: Lock, color: "text-vox-cyan" },
                  { label: "Trusted Devices", desc: "2 devices", icon: Shield, color: "text-vox-purple" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-vox-muted">{item.desc}</p>
                    </div>
                    <Check className="w-4 h-4 text-vox-green" />
                  </div>
                ))}
                <button
                  onClick={() => { setShowProtectionModal(false); showToast("Feature available for verified creators"); }}
                  className="w-full glass rounded-2xl py-3 text-sm font-semibold text-vox-muted touch-feedback"
                >
                  Security Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
