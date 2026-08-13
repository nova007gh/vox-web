"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FeedPosts from "../FeedPosts";
import { subscribeToActiveStreams, type LiveStream } from "@/lib/firebase-store";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Music,
  Sparkles,
  Smile,
  Shirt,
  ChefHat,
  Monitor,
  Heart,
  Trophy,
  Play,
  Pause,
  TrendingUp,
  Eye,
  Users,
  X,
  SearchX,
  RotateCcw,
  Check,
  Radio,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */

const trendingSearches = [
  "Afrobeats dance",
  "Ghana fashion",
  "VOX challenge",
];

const trends = [
  { tag: "#DanceChallenge", views: "2.4M views", gradient: "from-purple-600 to-pink-500" },
  { tag: "#GhanaVibes", views: "1.8M views", gradient: "from-orange-500 to-red-500" },
  { tag: "#VOXCreator", views: "950K views", gradient: "from-cyan-500 to-blue-500" },
  { tag: "#AfroBeats", views: "3.1M views", gradient: "from-pink-500 to-orange-500" },
  { tag: "#LiveShopping", views: "720K views", gradient: "from-green-500 to-teal-500" },
];

const categories = [
  { label: "Music", icon: Music, color: "text-vox-purple", bg: "bg-vox-purple/15", border: "border-vox-purple/20" },
  { label: "Dance", icon: Sparkles, color: "text-vox-pink", bg: "bg-vox-pink/15", border: "border-vox-pink/20" },
  { label: "Comedy", icon: Smile, color: "text-vox-orange", bg: "bg-vox-orange/15", border: "border-vox-orange/20" },
  { label: "Fashion", icon: Shirt, color: "text-rose-400", bg: "bg-rose-400/15", border: "border-rose-400/20" },
  { label: "Food", icon: ChefHat, color: "text-amber-400", bg: "bg-amber-400/15", border: "border-amber-400/20" },
  { label: "Tech", icon: Monitor, color: "text-vox-cyan", bg: "bg-vox-cyan/15", border: "border-vox-cyan/20" },
  { label: "Beauty", icon: Heart, color: "text-vox-pink", bg: "bg-vox-pink/15", border: "border-vox-pink/20" },
  { label: "Sports", icon: Trophy, color: "text-vox-green", bg: "bg-vox-green/15", border: "border-vox-green/20" },
];

const creators = [
  { name: "JUST WEAR WIGS", handle: "@just_wearwigs", username: "just_wearwigs", followers: "2,096", gradient: "from-vox-purple to-vox-pink", avatar: "/profiles/justwearwigs/avatar.jpeg" },
  { name: "Glow By Nana", handle: "@glowbynana", username: "glowbynana", followers: "1.2M", gradient: "from-vox-cyan to-vox-purple", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Berry Beauty", handle: "@berrybeauty", username: "berrybeauty", followers: "890K", gradient: "from-vox-orange to-vox-pink", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Hair By Maame", handle: "@hairbymaame", username: "hairbymaame", followers: "650K", gradient: "from-vox-pink to-vox-purple", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Wigs By Akua", handle: "@wigsbyakua", username: "wigsbyakua", followers: "420K", gradient: "from-vox-green to-vox-cyan", avatar: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Afro Queen", handle: "@afroqueen", username: "afroqueen", followers: "2.1M", gradient: "from-vox-orange to-vox-purple", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "SNY Obeng", handle: "@snyobeng", username: "snyobeng", followers: "892", gradient: "from-indigo-500 to-purple-600", avatar: "/profiles/snyobeng/123121.jpeg" },
  { name: "Mandiya Joseph", handle: "@mandiyajoseph", username: "mandiyajoseph", followers: "45.2K", gradient: "from-amber-500 to-orange-600", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Haroon Twins", handle: "@haroontwins", username: "haroontwins", followers: "2.1M", gradient: "from-cyan-500 to-blue-600", avatar: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Afro Figo", handle: "@afro_figo", username: "afro_figo", followers: "78.3K", gradient: "from-purple-500 to-pink-600", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "Chef Abbys", handle: "@chefabbys", username: "chefabbys", followers: "156K", gradient: "from-orange-500 to-red-600", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { name: "De Breezx", handle: "@de_breezx", username: "de_breezx", followers: "1.1M", gradient: "from-green-500 to-teal-600", avatar: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
];

const popularVideos = [
  { id: 1, views: "12.4K", viewsNum: 12400, likesNum: 8900, daysAgo: 2, duration: 45, creator: "JUST WEAR WIGS", title: "Ready to Wear Wig Unboxing 💇‍♀️", category: "Beauty", gradient: "from-purple-900 via-fuchsia-950 to-pink-900", thumbnail: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 2, views: "8.9K", viewsNum: 8900, likesNum: 5600, daysAgo: 5, duration: 180, creator: "Glow By Nana", title: "Frontal Ponytail Install Tutorial", category: "Beauty", gradient: "from-cyan-900 via-sky-950 to-blue-900", thumbnail: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 3, views: "21.3K", viewsNum: 21300, likesNum: 15000, daysAgo: 1, duration: 90, creator: "Hair By Maame", title: "Hair Extensions Transformation 💁‍♀️", category: "Beauty", gradient: "from-orange-900 via-amber-950 to-red-900", thumbnail: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 4, views: "5.6K", viewsNum: 5600, likesNum: 3200, daysAgo: 12, duration: 25, creator: "Berry Beauty", title: "Lace Frontal Application Tutorial", category: "Beauty", gradient: "from-pink-900 via-rose-950 to-red-900", thumbnail: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 5, views: "34.2K", viewsNum: 34200, likesNum: 28000, daysAgo: 3, duration: 240, creator: "Afro Queen", title: "Natural Hair Care Routine 👑", category: "Beauty", gradient: "from-green-900 via-emerald-950 to-teal-900", thumbnail: "https://images.unsplash.com/photo-1613730318129-bf0ca2a12364?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 6, views: "7.8K", viewsNum: 7800, likesNum: 4100, daysAgo: 8, duration: 150, creator: "Wigs By Akua", title: "Bob Wig Styling Tutorial", category: "Beauty", gradient: "from-violet-900 via-indigo-950 to-purple-900", thumbnail: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 7, views: "15.1K", viewsNum: 15100, likesNum: 11000, daysAgo: 1, duration: 20, creator: "JUST WEAR WIGS", title: "Wig Collection Tour ✨", category: "Beauty", gradient: "from-fuchsia-900 via-pink-950 to-rose-900", thumbnail: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 8, views: "3.4K", viewsNum: 3400, likesNum: 1800, daysAgo: 20, duration: 60, creator: "Glow By Nana", title: "Hair Growth Oil Tutorial", category: "Beauty", gradient: "from-blue-900 via-cyan-950 to-teal-900", thumbnail: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 9, views: "6.7K", viewsNum: 6700, likesNum: 3900, daysAgo: 6, duration: 75, creator: "Slayed By Esi", title: "Wig Install for Client", category: "Beauty", gradient: "from-amber-900 via-orange-950 to-red-900", thumbnail: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 10, views: "18.2K", viewsNum: 18200, likesNum: 13000, daysAgo: 4, duration: 35, creator: "Berry Beauty", title: "Edge Styling Tutorial 🔥", category: "Beauty", gradient: "from-rose-900 via-pink-950 to-fuchsia-900", thumbnail: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 11, views: "9.1K", viewsNum: 9100, likesNum: 6700, daysAgo: 15, duration: 200, creator: "Hair By Maame", title: "Bundle Deal Unboxing", category: "Beauty", gradient: "from-teal-900 via-green-950 to-emerald-900", thumbnail: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
  { id: 12, views: "4.5K", viewsNum: 4500, likesNum: 2400, daysAgo: 25, duration: 50, creator: "Afro Queen", title: "Protective Style Tutorial", category: "Beauty", gradient: "from-indigo-900 via-violet-950 to-purple-900", thumbnail: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=400&h=600&auto=format&fit=crop" },
];

const trendingSounds = [
  { name: "Hair Tutorial Beat", artist: "JUST WEAR WIGS", uses: "45.2K", art: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces" },
  { name: "Beauty Salon Vibes", artist: "Glow By Nana", uses: "32.1K", art: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces" },
  { name: "Wig Install Mix", artist: "Berry Beauty", uses: "28.7K", art: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces" },
  { name: "Hair Extensions Beat", artist: "Hair By Maame", uses: "51.3K", art: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces" },
  { name: "Natural Hair Anthem", artist: "Afro Queen", uses: "19.8K", art: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces" },
];

/* ─────────────────────────── SECTION HEADER ─────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-vox-orange" />}
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function ExplorePage() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "views" | "recent" | "likes">("trending");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStreams((streams) => {
      setLiveStreams(streams);
    });
    return () => unsubscribe();
  }, []);
  const [durationFilter, setDurationFilter] = useState<"short" | "medium" | "long" | "all">("all");
  const searchRef = useRef<HTMLDivElement>(null);
  const creatorsRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);

  const toggleFollow = (handle: string) => {
    setFollowedCreators((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  };

  const handleTrendClick = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleCategoryClick = (label: string) => {
    setSelectedCategory(label);
    setTimeout(() => {
      popularRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCreatorClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleSoundTitleClick = () => {
    router.push("/create");
  };

  const scrollToCreators = () => {
    creatorsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVideoClick = () => {
    router.push("/");
  };

  const togglePlaySound = (name: string) => {
    setPlayingSound((prev) => (prev === name ? null : name));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const resetFilters = () => {
    setSortBy("trending");
    setDateFilter("all");
    setDurationFilter("all");
  };

  const hasActiveFilters =
    sortBy !== "trending" || dateFilter !== "all" || durationFilter !== "all";

  /* ── Filtering logic ── */
  const query = searchQuery.trim().toLowerCase();

  const filteredVideos = popularVideos
    .filter((video) => {
      const matchesQuery =
        !query ||
        video.creator.toLowerCase().includes(query) ||
        video.title.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && video.daysAgo <= 1) ||
        (dateFilter === "week" && video.daysAgo <= 7) ||
        (dateFilter === "month" && video.daysAgo <= 30);
      const matchesDuration =
        durationFilter === "all" ||
        (durationFilter === "short" && video.duration < 30) ||
        (durationFilter === "medium" && video.duration >= 30 && video.duration <= 120) ||
        (durationFilter === "long" && video.duration > 120);
      return matchesQuery && matchesCategory && matchesDate && matchesDuration;
    })
    .sort((a, b) => {
      if (sortBy === "views") return b.viewsNum - a.viewsNum;
      if (sortBy === "recent") return a.daysAgo - b.daysAgo;
      if (sortBy === "likes") return b.likesNum - a.likesNum;
      return 0; // trending = original order
    });

  const filteredCreators = creators.filter((creator) => {
    if (!query) return true;
    return (
      creator.name.toLowerCase().includes(query) ||
      creator.handle.toLowerCase().includes(query)
    );
  });

  const filteredSounds = trendingSounds.filter((sound) => {
    if (!query) return true;
    return (
      sound.name.toLowerCase().includes(query) ||
      sound.artist.toLowerCase().includes(query)
    );
  });

  const hasNoResults =
    query.length > 0 &&
    filteredVideos.length === 0 &&
    filteredCreators.length === 0 &&
    filteredSounds.length === 0;

  const isSearching = query.length > 0;

  return (
    <div className="relative min-h-full overflow-x-hidden scrollbar-hide pb-24 lg:pb-0" style={{ paddingBottom: "calc(6rem + var(--safe-bottom, 0px))" }}>
      {/* ═══════ STICKY SEARCH BAR ═══════ */}
      <div className="sticky top-0 z-30 px-3 sm:px-4 pb-3 glass-strong backdrop-blur-xl" style={{ paddingTop: "var(--safe-top)" }} ref={searchRef}>
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white/[0.06] rounded-full px-4 py-2.5 focus-within:border-vox-purple/40 transition-colors">
              <Search className="w-4.5 h-4.5 text-vox-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search VOXel..."
                className="flex-1 min-w-0 bg-transparent text-base text-white placeholder:text-vox-muted outline-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1.5 rounded-full hover:bg-white/[0.06] transition-colors touch-feedback"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilterPanel((prev) => !prev)}
              className={`shrink-0 w-10 h-10 rounded-full glass flex items-center justify-center touch-feedback transition-colors ${
                showFilterPanel ? "bg-vox-purple/20 text-vox-purple" : "text-vox-muted"
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl p-4 space-y-4 shadow-xl shadow-black/30 max-h-[70vh] overflow-y-auto scrollbar-hide"
              >
                {/* Sort by */}
                <div className="space-y-2">
                  <p className="text-xs text-vox-muted font-medium">Sort by</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: "trending", label: "Trending" },
                      { key: "views", label: "Most Viewed" },
                      { key: "recent", label: "Recent" },
                      { key: "likes", label: "Most Liked" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-feedback ${
                          sortBy === opt.key
                            ? "btn-gradient text-white"
                            : "glass text-vox-muted hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <p className="text-xs text-vox-muted font-medium">Date</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: "today", label: "Today" },
                      { key: "week", label: "This Week" },
                      { key: "month", label: "This Month" },
                      { key: "all", label: "All Time" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setDateFilter(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-feedback ${
                          dateFilter === opt.key
                            ? "btn-gradient text-white"
                            : "glass text-vox-muted hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <p className="text-xs text-vox-muted font-medium">Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: "short", label: "Short (<30s)" },
                      { key: "medium", label: "Medium (30s–2min)" },
                      { key: "long", label: "Long (>2min)" },
                      { key: "all", label: "Any" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setDurationFilter(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-feedback ${
                          durationFilter === opt.key
                            ? "btn-gradient text-white"
                            : "glass text-vox-muted hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <p className="text-xs text-vox-muted font-medium">Filter by category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-feedback ${
                        selectedCategory === "All"
                          ? "btn-gradient text-white"
                          : "glass text-vox-muted hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => setSelectedCategory(cat.label)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all touch-feedback ${
                          selectedCategory === cat.label
                            ? "btn-gradient text-white"
                            : "glass text-vox-muted hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold btn-gradient text-white touch-feedback flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold touch-feedback flex items-center justify-center gap-1.5 transition-all ${
                      hasActiveFilters
                        ? "glass text-vox-muted hover:text-white"
                        : "glass text-vox-muted/40 cursor-not-allowed"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trending Searches Dropdown */}
          <AnimatePresence>
            {searchFocused && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl p-3 space-y-1 shadow-xl shadow-black/30"
              >
                <p className="text-xs text-vox-muted font-medium px-2 pb-1">Trending Searches</p>
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onMouseDown={() => setSearchQuery(term)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left touch-feedback"
                  >
                    <TrendingUp className="w-4 h-4 text-vox-pink shrink-0" />
                    <span className="text-sm text-white">{term}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ PAGE CONTENT ═══════ */}
      <div className="px-3 sm:px-4 space-y-8 max-w-3xl mx-auto overflow-x-hidden">
        {/* ── NO RESULTS STATE ── */}
        {hasNoResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-vox-muted" />
            </div>
            <p className="text-base md:text-lg font-semibold text-white mb-1">No results found</p>
            <p className="text-sm text-vox-muted mb-4">
              We couldn&apos;t find anything for &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={clearSearch}
              className="px-4 py-2 rounded-xl text-sm font-semibold btn-gradient text-white touch-feedback"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {/* ── TRENDING NOW ── */}
        {!isSearching && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Real-time posts from all users */}
            <FeedPosts />

            <SectionHeader icon={Flame} title="Trending Now" />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              {trends.map((trend, i) => (
                <motion.button
                  key={trend.tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  onClick={() => handleTrendClick(trend.tag)}
                  className={`shrink-0 w-40 sm:w-48 glass rounded-2xl p-3 sm:p-4 touch-feedback card-hover group text-left`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Flame className="w-3.5 h-3.5 text-vox-orange" />
                    <span className="text-[10px] text-vox-muted font-medium uppercase tracking-wide">Trending</span>
                  </div>
                  <p className="text-white text-sm font-bold">{trend.tag}</p>
                  <p className="text-vox-muted text-xs mt-1">{trend.views}</p>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── LIVE NOW ── */}
        {!isSearching && liveStreams.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <SectionHeader icon={Radio} title="Live Now" />
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              {liveStreams.map((stream, i) => (
                <motion.button
                  key={stream.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                  onClick={() => router.push(`/live?watch=${stream.id}`)}
                  className="shrink-0 w-40 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden relative touch-feedback card-hover text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-vox-purple/30 via-vox-pink/20 to-black/80" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-vox-danger/90 rounded-full px-2 py-0.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white">LIVE</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 space-y-1">
                    <p className="text-sm font-bold text-white truncate leading-tight">{stream.title}</p>
                    <p className="text-[10px] text-vox-muted">{stream.hostName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-white/70">
                      <Eye className="w-3 h-3" />
                      <span>{stream.viewers.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── BROWSE CATEGORIES ── */}
        {!isSearching && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionHeader title="Browse Categories" />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* All option */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => handleCategoryClick("All")}
                className={`glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 touch-feedback card-hover group border ${
                  selectedCategory === "All"
                    ? "border-transparent bg-gradient-to-br from-vox-purple to-vox-pink"
                    : "border-white/10"
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                  selectedCategory === "All" ? "bg-white/20" : "bg-white/10"
                }`}>
                  <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCategory === "All" ? "text-white" : "text-vox-muted"}`} />
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === "All" ? "text-white" : "text-vox-muted group-hover:text-white"
                }`}>
                  All
                </span>
              </motion.button>
              {categories.map((cat, i) => {
                const isActive = selectedCategory === cat.label;
                return (
                  <motion.button
                    key={cat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                    onClick={() => handleCategoryClick(cat.label)}
                    className={`glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 touch-feedback card-hover group border ${
                      isActive ? "border-transparent bg-gradient-to-br from-vox-purple to-vox-pink" : cat.border
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <cat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : cat.color}`} />
                    </div>
                    <span className={`text-xs sm:text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-vox-muted group-hover:text-white"
                    }`}>
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── CREATORS TO FOLLOW ── */}
        {filteredCreators.length > 0 && (
          <motion.section
            ref={creatorsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SectionHeader
              icon={Users}
              title="Creators to Follow"
              action={
                !isSearching && (
                  <button
                    onClick={scrollToCreators}
                    className="text-xs text-vox-muted hover:text-white transition-colors font-medium touch-feedback"
                  >
                    See all
                  </button>
                )
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredCreators.map((creator, i) => {
                const isFollowing = followedCreators.includes(creator.handle);
                return (
                  <motion.div
                    key={creator.handle}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                    onClick={() => handleCreatorClick(creator.username)}
                    className="glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 touch-feedback card-hover cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${creator.gradient} p-0.5 ring-2 ring-white/10`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate w-full text-center">{creator.name}</p>
                    <p className="text-[10px] text-vox-muted truncate w-full text-center">{creator.handle}</p>
                    <p className="text-[10px] text-vox-muted">
                      <span className="text-white font-medium">{creator.followers}</span> followers
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(creator.handle);
                      }}
                      className={`w-full px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 touch-feedback ${
                        isFollowing
                          ? "glass text-vox-muted hover:text-white"
                          : "btn-gradient text-white"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── POPULAR THIS WEEK ── */}
        {filteredVideos.length > 0 && (
          <motion.section
            ref={popularRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionHeader
              icon={Eye}
              title="Popular This Week"
              action={
                !isSearching && (
                  <button
                    onClick={() => popularRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="text-xs text-vox-muted hover:text-white transition-colors font-medium touch-feedback"
                  >
                    See all
                  </button>
                )
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                  onClick={handleVideoClick}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer touch-feedback card-hover"
                >
                  {/* Thumbnail image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail}
                    alt={video.creator}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient overlay for readability */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${video.gradient} opacity-30`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Play icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-medium text-white/90">{video.category}</span>
                  </div>

                  {/* Creator name + title + view count with play icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Play className="w-2.5 h-2.5 text-white fill-white" />
                      <span className="text-[10px] font-medium text-white/90">{video.views}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-white/90 truncate">{video.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-white/60 truncate">{video.creator}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── TRENDING SOUNDS ── */}
        {filteredSounds.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <SectionHeader icon={Music} title="Trending Sounds" />
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              {filteredSounds.map((sound, i) => {
                const isPlaying = playingSound === sound.name;
                return (
                  <motion.div
                    key={sound.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                    className="glass rounded-2xl p-3 flex items-center gap-2 sm:gap-3 w-56 sm:w-64 shrink-0 touch-feedback card-hover group"
                  >
                    {/* Album art */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sound.art}
                        alt={sound.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={handleSoundTitleClick}>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate hover:text-vox-purple transition-colors">{sound.name}</p>
                      <p className="text-[10px] text-vox-muted truncate">{sound.artist}</p>
                      {isPlaying && (
                        <div className="flex items-end gap-0.5 h-3 mt-1">
                          {[0, 1, 2, 3, 4].map((bar) => (
                            <motion.span
                              key={bar}
                              className="w-0.5 rounded-full bg-vox-pink"
                              animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: bar * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Play button */}
                    <button
                      onClick={() => togglePlaySound(sound.name)}
                      className="shrink-0 w-8 h-8 rounded-full btn-gradient flex items-center justify-center touch-feedback"
                      aria-label={isPlaying ? "Pause sound" : "Play sound"}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-white fill-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
