"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  AtSign,
  Gift,
  Trophy,
  Check,
} from "lucide-react";

/* ─────────────────────────── DATA ─────────────────────────── */

const tabs = [
  { label: "All", count: 8 },
  { label: "Likes", count: 3 },
  { label: "Comments", count: 2 },
  { label: "Follows", count: 1 },
  { label: "Mentions", count: 1 },
  { label: "System", count: 1 },
];

const notifications = [
  { id: 1, type: "like", user: "Glow By Nana", handle: "@glowbynana", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", avatarGradient: "from-vox-orange to-vox-pink", message: "liked your video", detail: "\"Ready to Wear Wig Unboxing 💇‍♀️\"", time: "2m ago", icon: Heart, iconColor: "text-pink-400", iconBg: "bg-pink-400/15", action: "View", unread: true },
  { id: 2, type: "follow", user: "Berry Beauty", handle: "@berrybeauty", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", avatarGradient: "from-vox-cyan to-vox-purple", message: "started following you", detail: null, time: "15m ago", icon: UserPlus, iconColor: "text-blue-400", iconBg: "bg-blue-400/15", action: "Follow Back", unread: true },
  { id: 3, type: "comment", user: "Hair By Maame", handle: "@hairbymaame", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", avatarGradient: "from-vox-pink to-vox-purple", message: "commented:", detail: "\"Gorgeous wig! 🔥🔥🔥\"", time: "1h ago", icon: MessageCircle, iconColor: "text-cyan-400", iconBg: "bg-cyan-400/15", action: "Reply", unread: true },
  { id: 4, type: "system", user: "VOXel", handle: "@voxel", avatar: "https://images.unsplash.com/photo-1635765794916-84e7b4b6a84c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop", avatarGradient: "from-vox-green to-emerald-500", message: "Your video reached 10K views!", detail: "\"Frontal Ponytail Tutorial\"", time: "3h ago", icon: TrendingUp, iconColor: "text-green-400", iconBg: "bg-green-400/15", action: "View Stats", unread: true },
  { id: 5, type: "system", user: "VOX Support", handle: "@voxsupport", avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop", avatarGradient: "from-vox-green to-vox-cyan", message: "Seller verification approved", detail: "Your seller badge is now active", time: "5h ago", icon: CheckCircle2, iconColor: "text-green-400", iconBg: "bg-green-400/15", action: "View Profile", unread: false },
  { id: 6, type: "mention", user: "Afro Queen", handle: "@afroqueen", avatar: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", avatarGradient: "from-rose-500 to-orange-500", message: "mentioned you in a video", detail: "\"Collab with @just_wearwigs coming soon! 💇‍♀️\"", time: "Yesterday", icon: AtSign, iconColor: "text-orange-400", iconBg: "bg-orange-400/15", action: "View", unread: false },
  { id: 7, type: "gift", user: "Wigs By Akua", handle: "@wigsbyakua", avatar: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", avatarGradient: "from-vox-purple to-violet-500", message: "sent you a gift", detail: "💎 Diamond", time: "Yesterday", icon: Gift, iconColor: "text-purple-400", iconBg: "bg-purple-400/15", action: "Thank", unread: false },
  { id: 8, type: "system", user: "VOXel", handle: "@voxel", avatar: "https://images.unsplash.com/photo-1635765794916-84e7b4b6a84c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop", avatarGradient: "from-yellow-500 to-amber-500", message: "New follower milestone: 2,000!", detail: "You're on fire! Keep creating 🎉", time: "2 days ago", icon: Trophy, iconColor: "text-yellow-400", iconBg: "bg-yellow-400/15", action: "Share", unread: false },
  { id: 9, type: "follow", user: "SNY Obeng", handle: "@snyobeng", avatar: "/profiles/snyobeng/123121.jpeg", avatarGradient: "from-indigo-500 to-purple-600", message: "started following you", detail: null, time: "3 days ago", icon: UserPlus, iconColor: "text-blue-400", iconBg: "bg-blue-400/15", action: "Follow Back", unread: false },
];

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const [followedBack, setFollowedBack] = useState<Set<number>>(new Set());
  const [actionFeedback, setActionFeedback] = useState<{ id: number; text: string } | null>(null);
  const [allReadToast, setAllReadToast] = useState(false);

  const markAllRead = () => {
    setReadNotifications(notifications.map((n) => n.id));
    setAllReadToast(true);
    setTimeout(() => setAllReadToast(false), 2500);
  };

  const isUnread = (n: (typeof notifications)[0]) => n.unread && !readNotifications.includes(n.id);

  const filteredNotifications = activeTab === "All"
    ? notifications
    : notifications.filter((n) => {
        switch (activeTab) {
          case "Likes": return n.type === "like";
          case "Comments": return n.type === "comment";
          case "Follows": return n.type === "follow";
          case "Mentions": return n.type === "mention";
          case "System": return n.type === "system" || n.type === "gift";
          default: return true;
        }
      });

  const handleAction = (e: React.MouseEvent, notification: typeof notifications[0]) => {
    e.stopPropagation();
    setReadNotifications((prev) => prev.includes(notification.id) ? prev : [...prev, notification.id]);

    switch (notification.action) {
      case "View":
      case "View Stats":
        router.push("/");
        break;
      case "Follow Back":
        setFollowedBack((prev) => { const s = new Set(prev); s.add(notification.id); return s; });
        showFeedback(notification.id, "Following!");
        break;
      case "Reply":
        router.push("/messages");
        break;
      case "Thank":
        showFeedback(notification.id, "Thank you sent! 💖");
        break;
      case "Share":
        if (navigator.share) {
          navigator.share({ title: "VOXel Achievement", text: notification.message }).catch(() => {});
        } else {
          showFeedback(notification.id, "Shared!");
        }
        break;
      case "View Profile":
        router.push("/profile");
        break;
    }
  };

  const showFeedback = (id: number, text: string) => {
    setActionFeedback({ id, text });
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleCardClick = (notification: typeof notifications[0]) => {
    setReadNotifications((prev) => prev.includes(notification.id) ? prev : [...prev, notification.id]);
    switch (notification.type) {
      case "like":
      case "comment":
      case "mention":
        router.push("/");
        break;
      case "follow":
        // Navigate to the follower's profile
        const username = notification.handle.replace("@", "");
        router.push(`/profile/${username}`);
        break;
      case "gift":
        router.push("/wallet");
        break;
      case "system":
        break;
    }
  };

  const getActionText = (notification: typeof notifications[0]) => {
    if (notification.action === "Follow Back" && followedBack.has(notification.id)) return "Following";
    if (actionFeedback?.id === notification.id) return actionFeedback.text;
    return notification.action;
  };

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-16 lg:pb-0">
      {/* ═══════ HEADER ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ paddingTop: "var(--safe-top)" }}
        className="sticky top-0 z-30 glass-strong backdrop-blur-xl px-3 sm:px-4 pb-3"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">Notifications</h1>
              {readNotifications.length < notifications.filter((n) => n.unread).length && (
                <span className="text-[10px] font-bold bg-gradient-to-r from-vox-pink to-vox-purple text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                  {notifications.filter((n) => n.unread).length - readNotifications.filter((id) => notifications.find((n) => n.id === id)?.unread).length}
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-vox-muted hover:text-white transition-colors flex items-center gap-1 touch-feedback"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full touch-feedback whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.label ? "glass text-white" : "text-vox-muted"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] ${activeTab === tab.label ? "text-white/70" : "text-vox-muted/60"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════ NOTIFICATION LIST ═══════ */}
      <div className="px-3 sm:px-4 pb-6 max-w-3xl mx-auto mt-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-2">
            {filteredNotifications.map((notification, i) => {
              const Icon = notification.icon;
              const unread = isUnread(notification);
              const actionText = getActionText(notification);
              const isFollowing = notification.action === "Follow Back" && followedBack.has(notification.id);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`glass rounded-2xl p-3 sm:p-4 flex items-center gap-3 touch-feedback active:bg-white/[0.04] card-hover group cursor-pointer relative ${unread ? "border-vox-purple/20" : ""}`}
                  onClick={() => handleCardClick(notification)}
                >
                  {unread && <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-vox-pink" />}

                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${notification.avatarGradient} p-0.5 ${unread ? "ring-2 ring-vox-purple/40" : "ring-2 ring-white/10"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={notification.avatar} alt={notification.user} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${notification.iconBg} border-2 border-vox-bg flex items-center justify-center`}>
                      <Icon className={`w-2.5 h-2.5 ${notification.iconColor}`} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug line-clamp-2">
                      <span className="font-semibold">{notification.user}</span> <span className="text-vox-muted">{notification.message}</span>
                    </p>
                    {notification.detail && <p className="text-xs text-white/60 mt-0.5 truncate">{notification.detail}</p>}
                    <p className="text-[10px] sm:text-xs text-vox-muted mt-1 whitespace-nowrap">{notification.time}</p>
                  </div>

                  <button
                    className={`shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-xl touch-feedback transition-all duration-200 ${
                      isFollowing ? "glass text-vox-muted" : notification.action === "Follow Back" ? "btn-gradient text-white" : "glass text-vox-muted hover:text-white"
                    }`}
                    onClick={(e) => handleAction(e, notification)}
                  >
                    {actionText}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 flex flex-col items-center">
            <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-vox-muted mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No notifications yet</p>
            <p className="text-sm text-vox-muted mt-1">You&apos;re all caught up</p>
          </motion.div>
        )}
      </div>

      {/* ═══════ ALL READ TOAST ═══════ */}
      <AnimatePresence>
        {allReadToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 z-[60] glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-vox-green" />
            All caught up!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
