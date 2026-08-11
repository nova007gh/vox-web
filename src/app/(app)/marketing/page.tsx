"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Calendar,
  Megaphone,
  Target,
  Zap,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  Sparkles,
  Hash,
  Video,
  Rocket,
} from "lucide-react";

/* ── Data ── */
const marketingTools = [
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-vox-cyan", gradient: "from-vox-cyan/30 to-vox-purple/30", desc: "Track your performance" },
  { id: "scheduler", label: "Scheduler", icon: Calendar, color: "text-vox-green", gradient: "from-vox-green/30 to-vox-cyan/30", desc: "Plan your posts" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, color: "text-vox-orange", gradient: "from-vox-orange/30 to-vox-pink/30", desc: "Run promotions" },
  { id: "hashtags", label: "Hashtag Lab", icon: Hash, color: "text-vox-pink", gradient: "from-vox-pink/30 to-vox-purple/30", desc: "Trending tags" },
  { id: "audience", label: "Audience", icon: Users, color: "text-vox-purple", gradient: "from-vox-purple/30 to-vox-cyan/30", desc: "Know your fans" },
  { id: "boost", label: "Boost Post", icon: Rocket, color: "text-vox-orange", gradient: "from-vox-orange/30 to-vox-pink/30", desc: "Reach more people" },
];

const statsCards = [
  { label: "Total Views", value: "12.4K", change: "+18%", up: true, icon: Eye, color: "text-vox-cyan" },
  { label: "Engagement", value: "8.7%", change: "+2.3%", up: true, icon: Heart, color: "text-vox-pink" },
  { label: "Followers", value: "1.2K", change: "+47", up: true, icon: Users, color: "text-vox-purple" },
  { label: "Shares", value: "342", change: "-5%", up: false, icon: Share2, color: "text-vox-orange" },
];

const weeklyData = [
  { day: "Mon", views: 1200, likes: 89 },
  { day: "Tue", views: 1800, likes: 142 },
  { day: "Wed", views: 2400, likes: 201 },
  { day: "Thu", views: 1900, likes: 156 },
  { day: "Fri", views: 3200, likes: 287 },
  { day: "Sat", views: 4100, likes: 342 },
  { day: "Sun", views: 3800, likes: 298 },
];

const trendingHashtags = [
  { tag: "afrobeats", posts: "2.4M", growth: "+12%", trend: "up" },
  { tag: "ghanabeauty", posts: "890K", growth: "+8%", trend: "up" },
  { tag: "wigs", posts: "1.2M", growth: "+15%", trend: "up" },
  { tag: "lacefrontal", posts: "567K", growth: "+22%", trend: "up" },
  { tag: "accra", posts: "3.1M", growth: "+5%", trend: "up" },
  { tag: "blackgirlmagic", posts: "5.6M", growth: "+3%", trend: "up" },
  { tag: "hairstylist", posts: "1.8M", growth: "+9%", trend: "up" },
  { tag: "wiginstall", posts: "445K", growth: "+18%", trend: "up" },
];

const scheduledPosts = [
  { id: 1, title: "New wig collection reveal", time: "Today, 6:00 PM", platform: "VOXel", status: "ready" },
  { id: 2, title: "Customer testimonial video", time: "Tomorrow, 10:00 AM", platform: "VOXel", status: "draft" },
  { id: 3, title: "Flash sale announcement", time: "Fri, 12:00 PM", platform: "VOXel", status: "ready" },
  { id: 4, title: "Behind the scenes", time: "Sat, 3:00 PM", platform: "VOXel", status: "draft" },
];

const activeCampaigns = [
  { id: 1, name: "Summer Wig Collection", budget: 500, spent: 320, reach: "12.4K", clicks: 890, status: "active" },
  { id: 2, name: "New Customer Discount", budget: 200, spent: 200, reach: "8.1K", clicks: 567, status: "completed" },
];

export default function MarketingPage() {
  const router = useRouter();
  const { currentUser, hydrated } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [hydrated, currentUser, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (!hydrated || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  const maxViews = Math.max(...weeklyData.map((d) => d.views));

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-20 lg:pb-8 space-y-6" style={{ paddingBottom: "calc(5rem + var(--safe-bottom, 0px))" }}>
        {/* ═══════ HEADER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-orange to-vox-pink flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Marketing Hub</h1>
              <p className="text-xs text-vox-muted">Grow your audience & boost sales</p>
            </div>
          </div>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold text-white touch-feedback flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </motion.div>

        {/* ═══════ STATS CARDS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${stat.up ? "text-vox-green" : "text-red-400"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-vox-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════ MARKETING TOOLS GRID ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-bold text-white mb-3">Marketing Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {marketingTools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (tool.id === "scheduler") setShowScheduleModal(true);
                  else if (tool.id === "campaigns") setShowCampaignModal(true);
                  else if (tool.id === "boost") setShowBoostModal(true);
                  else setActiveTool(activeTool === tool.id ? null : tool.id);
                }}
                className="glass rounded-2xl p-4 flex flex-col items-start gap-2 touch-feedback card-hover group text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tool.label}</p>
                  <p className="text-[11px] text-vox-muted">{tool.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ═══════ ANALYTICS CHART ═══════ */}
        {activeTool === "analytics" && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-vox-cyan" />
                <h3 className="text-sm font-bold text-white">Weekly Performance</h3>
              </div>
              <div className="flex items-end justify-between gap-2 h-40">
                {weeklyData.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.views / maxViews) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-vox-purple to-vox-cyan relative group cursor-pointer"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                          {d.views} views
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[10px] text-vox-muted">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <p className="text-[10px] text-vox-muted">Best Day</p>
                  <p className="text-sm font-bold text-white">Saturday</p>
                </div>
                <div>
                  <p className="text-[10px] text-vox-muted">Avg Engagement</p>
                  <p className="text-sm font-bold text-white">7.8%</p>
                </div>
                <div>
                  <p className="text-[10px] text-vox-muted">Total Likes</p>
                  <p className="text-sm font-bold text-white">1,515</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════ HASHTAG LAB ═══════ */}
        {activeTool === "hashtags" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-vox-pink" />
                <h3 className="text-sm font-bold text-white">Trending Hashtags</h3>
              </div>
              <div className="space-y-2">
                {trendingHashtags.map((tag, i) => (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition cursor-pointer group"
                    onClick={() => {
                      navigator.clipboard?.writeText(`#${tag.tag}`);
                      showToast(`Copied #${tag.tag}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-vox-pink/10 flex items-center justify-center">
                        <Hash className="w-4 h-4 text-vox-pink" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">#{tag.tag}</p>
                        <p className="text-[11px] text-vox-muted">{tag.posts} posts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-vox-green flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {tag.growth}
                      </span>
                      <span className="text-[10px] text-vox-muted opacity-0 group-hover:opacity-100 transition">Tap to copy</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════ AUDIENCE INSIGHTS ═══════ */}
        {activeTool === "audience" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-strong rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-vox-purple" />
                <h3 className="text-sm font-bold text-white">Audience Insights</h3>
              </div>

              {/* Demographics */}
              <div>
                <p className="text-xs text-vox-muted mb-2">Top Locations</p>
                <div className="space-y-2">
                  {[
                    { loc: "Accra, Ghana", pct: 42 },
                    { loc: "Lagos, Nigeria", pct: 28 },
                    { loc: "Kumasi, Ghana", pct: 15 },
                    { loc: "London, UK", pct: 8 },
                    { loc: "Other", pct: 7 },
                  ].map((d) => (
                    <div key={d.loc} className="flex items-center gap-3">
                      <span className="text-xs text-white w-32 truncate">{d.loc}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-vox-purple to-vox-pink"
                        />
                      </div>
                      <span className="text-xs text-vox-muted w-8 text-right">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age groups */}
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-vox-muted mb-2">Age Groups</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { age: "18-24", pct: 35 },
                    { age: "25-34", pct: 42 },
                    { age: "35-44", pct: 15 },
                    { age: "45+", pct: 8 },
                  ].map((a) => (
                    <div key={a.age} className="glass rounded-xl p-2.5 text-center">
                      <p className="text-lg font-bold text-white">{a.pct}%</p>
                      <p className="text-[10px] text-vox-muted">{a.age}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active hours */}
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-vox-muted mb-2">Best Times to Post</p>
                <div className="flex gap-1.5">
                  {["6am", "9am", "12pm", "3pm", "6pm", "9pm"].map((t, i) => (
                    <div key={t} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-lg ${[30, 50, 70, 85, 100, 60][i] > 80 ? "bg-vox-green" : [30, 50, 70, 85, 100, 60][i] > 50 ? "bg-vox-orange" : "bg-white/10"}`}
                        style={{ height: `${[30, 50, 70, 85, 100, 60][i] * 0.4}px` }}
                      />
                      <span className="text-[9px] text-vox-muted">{t}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-vox-green mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Best time: 6:00 PM
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════ ACTIVE CAMPAIGNS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Active Campaigns</h2>
            <button onClick={() => setShowCampaignModal(true)} className="text-xs text-vox-pink hover:underline touch-feedback">Create New</button>
          </div>
          <div className="space-y-3">
            {activeCampaigns.map((camp, i) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-vox-orange/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-vox-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{camp.name}</p>
                      <p className="text-[10px] text-vox-muted">
                        {camp.status === "active" ? (
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-vox-green animate-pulse" /> Active</span>
                        ) : "Completed"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-vox-muted">₵{camp.budget}</span>
                </div>
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-vox-muted mb-1">
                    <span>Spent: ₵{camp.spent}</span>
                    <span>{Math.round((camp.spent / camp.budget) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(camp.spent / camp.budget) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-vox-orange to-vox-pink"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-white">{camp.reach}</p>
                    <p className="text-[10px] text-vox-muted">Reach</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-white">{camp.clicks}</p>
                    <p className="text-[10px] text-vox-muted">Clicks</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ SCHEDULED POSTS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Scheduled Posts</h2>
            <button onClick={() => setShowScheduleModal(true)} className="text-xs text-vox-pink hover:underline touch-feedback">Schedule New</button>
          </div>
          <div className="space-y-2">
            {scheduledPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="glass rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vox-purple/20 to-vox-pink/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-vox-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <p className="text-[11px] text-vox-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.time}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${post.status === "ready" ? "bg-vox-green/20 text-vox-green" : "bg-white/[0.06] text-vox-muted"}`}>
                  {post.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ QUICK ACTIONS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link href="/create" className="glass rounded-2xl p-4 flex items-center gap-3 touch-feedback card-hover group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-cyan/30 to-vox-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5 text-vox-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Create Post</p>
              <p className="text-[11px] text-vox-muted">Share content</p>
            </div>
          </Link>
          <Link href="/marketplace" className="glass rounded-2xl p-4 flex items-center gap-3 touch-feedback card-hover group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-orange/30 to-vox-pink/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-vox-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sell Product</p>
              <p className="text-[11px] text-vox-muted">Post an ad</p>
            </div>
          </Link>
        </motion.section>
      </div>

      {/* ═══════ SCHEDULE MODAL ═══════ */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal onClose={() => setShowScheduleModal(false)} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* ═══════ CAMPAIGN MODAL ═══════ */}
      <AnimatePresence>
        {showCampaignModal && (
          <CampaignModal onClose={() => setShowCampaignModal(false)} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* ═══════ BOOST MODAL ═══════ */}
      <AnimatePresence>
        {showBoostModal && (
          <BoostModal onClose={() => setShowBoostModal(false)} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-full px-5 py-2.5 text-sm text-white font-medium shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════ SCHEDULE MODAL COMPONENT ═══════ */
function ScheduleModal({ onClose, showToast }: { onClose: () => void; showToast: (msg: string) => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [caption, setCaption] = useState("");

  const handleSchedule = () => {
    if (!title.trim() || !date || !time) {
      showToast("Please fill all fields");
      return;
    }
    // Save to localStorage
    const key = "voxel_scheduled_posts";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({
      id: Date.now(),
      title: title.trim(),
      date,
      time,
      caption: caption.trim(),
      createdAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(existing));
    showToast("Post scheduled successfully!");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-vox-green" />
            <h3 className="text-lg font-bold text-white">Schedule Post</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center text-vox-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Post Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New wig collection"
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-green/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-vox-muted mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-green/50"
            />
          </div>
          <div>
            <label className="text-sm text-vox-muted mb-1.5 block">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-green/50"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Caption (optional)</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-green/50 resize-none"
          />
        </div>

        <button
          onClick={handleSchedule}
          className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Schedule Post
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ CAMPAIGN MODAL COMPONENT ═══════ */
function CampaignModal({ onClose, showToast }: { onClose: () => void; showToast: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [target, setTarget] = useState("Followers");
  const [duration, setDuration] = useState("7 days");

  const handleCreate = () => {
    if (!name.trim() || !budget) {
      showToast("Please fill all fields");
      return;
    }
    const key = "voxel_campaigns";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({
      id: Date.now(),
      name: name.trim(),
      budget: parseInt(budget),
      spent: 0,
      target,
      duration,
      status: "active",
      createdAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(existing));
    showToast("Campaign created!");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-vox-orange" />
            <h3 className="text-lg font-bold text-white">New Campaign</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center text-vox-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Sale Promo"
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-orange/50"
          />
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Budget (₵)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="500"
            className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-white text-base focus:outline-none focus:border-vox-orange/50"
          />
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Target Audience</label>
          <div className="grid grid-cols-3 gap-2">
            {["Followers", "New Users", "All"].map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`glass rounded-xl p-2.5 text-xs font-medium ${target === t ? "border border-vox-orange text-white" : "text-vox-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-vox-muted mb-1.5 block">Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {["3 days", "7 days", "14 days", "30 days"].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`glass rounded-xl p-2.5 text-xs font-medium ${duration === d ? "border border-vox-orange text-white" : "text-vox-muted"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Launch Campaign
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════ BOOST MODAL COMPONENT ═══════ */
function BoostModal({ onClose, showToast }: { onClose: () => void; showToast: (msg: string) => void }) {
  const [selectedPackage, setSelectedPackage] = useState(0);
  const packages = [
    { name: "Basic", price: 50, reach: "1K-2K", duration: "24 hours", icon: Zap },
    { name: "Pro", price: 150, reach: "5K-10K", duration: "3 days", icon: Rocket, popular: true },
    { name: "Premium", price: 400, reach: "20K-50K", duration: "7 days", icon: Sparkles },
  ];

  const handleBoost = () => {
    showToast(`Boost purchased: ${packages[selectedPackage].name}!`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-vox-orange" />
            <h3 className="text-lg font-bold text-white">Boost Your Post</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center text-vox-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-vox-muted">Choose a boost package to reach more people</p>

        <div className="space-y-2">
          {packages.map((pkg, i) => (
            <button
              key={pkg.name}
              onClick={() => setSelectedPackage(i)}
              className={`w-full glass rounded-2xl p-4 flex items-center gap-3 touch-feedback transition-all ${selectedPackage === i ? "border border-vox-orange" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl ${selectedPackage === i ? "bg-vox-orange/20" : "bg-white/[0.06]"} flex items-center justify-center`}>
                <pkg.icon className={`w-5 h-5 ${selectedPackage === i ? "text-vox-orange" : "text-vox-muted"}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{pkg.name}</p>
                  {pkg.popular && <span className="text-[9px] bg-vox-orange/20 text-vox-orange px-1.5 py-0.5 rounded-full font-bold">POPULAR</span>}
                </div>
                <p className="text-[11px] text-vox-muted">Reach {pkg.reach} • {pkg.duration}</p>
              </div>
              <span className="text-sm font-bold text-white">₵{pkg.price}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleBoost}
          className="w-full btn-gradient rounded-2xl py-3 text-sm font-semibold text-white touch-feedback flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Boost for ₵{packages[selectedPackage].price}
        </button>
      </motion.div>
    </motion.div>
  );
}
