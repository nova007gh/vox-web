"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  Gift,
  Video,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  toggleFollow,
  isFollowing,
  type AppNotification,
} from "@/lib/content-store";

const iconMap = {
  like: { icon: Heart, color: "text-pink-400", bg: "bg-pink-400/15" },
  comment: { icon: MessageCircle, color: "text-cyan-400", bg: "bg-cyan-400/15" },
  follow: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/15" },
  gift: { icon: Gift, color: "text-purple-400", bg: "bg-purple-400/15" },
  mention: { icon: MessageCircle, color: "text-orange-400", bg: "bg-orange-400/15" },
  system: { icon: Bell, color: "text-green-400", bg: "bg-green-400/15" },
  live: { icon: Video, color: "text-red-400", bg: "bg-red-400/15" },
};

const tabs = ["All", "Likes", "Comments", "Follows", "Live"];

export default function NotificationsPage() {
  const router = useRouter();
  const { currentUser, hydrated } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const [allReadToast, setAllReadToast] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    setNotifs(getNotifications(currentUser.username));
    // Load existing follow status
    const followed = new Set<string>();
    // Check who we already follow
    setFollowedBack(followed);
  }, [hydrated, currentUser, router]);

  const refreshNotifs = () => {
    if (currentUser) setNotifs(getNotifications(currentUser.username));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    markAllNotificationsRead(currentUser.username);
    refreshNotifs();
    setAllReadToast(true);
    setTimeout(() => setAllReadToast(false), 2500);
  };

  const handleClearAll = () => {
    if (!currentUser) return;
    clearNotifications(currentUser.username);
    refreshNotifs();
  };

  const handleCardClick = (notif: AppNotification) => {
    if (currentUser) {
      markNotificationRead(currentUser.username, notif.id);
      refreshNotifs();
    }
    switch (notif.type) {
      case "like":
      case "comment":
      case "mention":
        router.push("/");
        break;
      case "follow":
        router.push(`/profile/${notif.fromUsername}`);
        break;
      case "gift":
        router.push("/wallet");
        break;
      case "live":
        router.push("/live");
        break;
      case "system":
        break;
    }
  };

  const handleFollowBack = (e: React.MouseEvent, notif: AppNotification) => {
    e.stopPropagation();
    if (currentUser) {
      toggleFollow(notif.fromUsername);
      setFollowedBack((prev) => {
        const s = new Set(prev);
        if (s.has(notif.fromUsername)) s.delete(notif.fromUsername);
        else s.add(notif.fromUsername);
        return s;
      });
    }
  };

  const filteredNotifs = activeTab === "All"
    ? notifs
    : notifs.filter((n) => {
        switch (activeTab) {
          case "Likes": return n.type === "like";
          case "Comments": return n.type === "comment";
          case "Follows": return n.type === "follow";
          case "Live": return n.type === "live";
          default: return true;
        }
      });

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!hydrated || !currentUser) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

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
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-gradient-to-r from-vox-pink to-vox-purple text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifs.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-vox-muted hover:text-vox-danger transition-colors flex items-center gap-1 touch-feedback"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-vox-muted hover:text-white transition-colors flex items-center gap-1 touch-feedback"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
            {tabs.map((tab) => {
              const count = tab === "All"
                ? notifs.length
                : tab === "Likes" ? notifs.filter(n => n.type === "like").length
                : tab === "Comments" ? notifs.filter(n => n.type === "comment").length
                : tab === "Follows" ? notifs.filter(n => n.type === "follow").length
                : tab === "Live" ? notifs.filter(n => n.type === "live").length
                : 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full touch-feedback whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === tab ? "glass text-white" : "text-vox-muted"
                  }`}
                >
                  {tab}
                  {count > 0 && <span className={`text-[10px] ${activeTab === tab ? "text-white/70" : "text-vox-muted/60"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══════ NOTIFICATION LIST ═══════ */}
      <div className="px-3 sm:px-4 pb-6 max-w-3xl mx-auto mt-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-2">
            {filteredNotifs.map((notif, i) => {
              const iconInfo = iconMap[notif.type] || iconMap.system;
              const Icon = iconInfo.icon;
              const alreadyFollowing = followedBack.has(notif.fromUsername) || isFollowing(notif.fromUsername);

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`glass rounded-2xl p-3 sm:p-4 flex items-center gap-3 touch-feedback active:bg-white/[0.04] card-hover group cursor-pointer relative ${!notif.read ? "border-vox-purple/20" : ""}`}
                  onClick={() => handleCardClick(notif)}
                >
                  {!notif.read && <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-vox-pink" />}

                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-0.5 ${!notif.read ? "ring-2 ring-vox-purple/40" : "ring-2 ring-white/10"}`}>
                      {notif.fromAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={notif.fromAvatar} alt={notif.fromName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-vox-bg flex items-center justify-center text-sm font-bold text-white">
                          {notif.fromName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${iconInfo.bg} border-2 border-vox-bg flex items-center justify-center`}>
                      <Icon className={`w-2.5 h-2.5 ${iconInfo.color}`} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug line-clamp-2">
                      <span className="font-semibold">{notif.fromName}</span> <span className="text-vox-muted">{notif.message}</span>
                    </p>
                    {notif.detail && <p className="text-xs text-white/60 mt-0.5 truncate">{notif.detail}</p>}
                    <p className="text-[10px] sm:text-xs text-vox-muted mt-1 whitespace-nowrap">{formatTime(notif.createdAt)}</p>
                  </div>

                  {notif.type === "follow" && (
                    <button
                      className={`shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-xl touch-feedback transition-all duration-200 ${
                        alreadyFollowing ? "glass text-vox-muted" : "btn-gradient text-white"
                      }`}
                      onClick={(e) => handleFollowBack(e, notif)}
                    >
                      {alreadyFollowing ? "Following" : "Follow Back"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredNotifs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 flex flex-col items-center">
            <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-vox-muted mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No notifications yet</p>
            <p className="text-sm text-vox-muted mt-1">
              {activeTab === "All"
                ? "When someone likes, comments, or follows you, it'll show here."
                : `No ${activeTab.toLowerCase()} notifications yet.`}
            </p>
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
