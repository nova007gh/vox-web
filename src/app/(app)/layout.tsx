"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { subscribeToUnreadCount } from "@/lib/firebase-store";
import { getUnreadCount, getActiveStreams } from "@/lib/content-store";
import {
  Home,
  PlusCircle,
  ShoppingBag,
  Wallet,
  MessageCircle,
  Radio,
  User,
  Bell,
  Menu,
  Compass,
  Megaphone,
} from "lucide-react";

/* ── nav items ── */
const mainNav = [
  { icon: Home, label: "Home", href: "/", matchPrefix: "/" },
  { icon: Compass, label: "Explore", href: "/explore", matchPrefix: "/explore" },
  { icon: Radio, label: "LIVE", href: "/live", matchPrefix: "/live" },
  { icon: MessageCircle, label: "Messages", href: "/messages", matchPrefix: "/messages" },
  { icon: Bell, label: "Alerts", href: "/notifications", matchPrefix: "/notifications" },
  { icon: ShoppingBag, label: "Marketplace", href: "/marketplace", matchPrefix: "/marketplace" },
  { icon: Megaphone, label: "Marketing", href: "/marketing", matchPrefix: "/marketing" },
  { icon: Wallet, label: "Wallet", href: "/wallet", matchPrefix: "/wallet" },
  { icon: User, label: "Profile", href: "/profile", matchPrefix: "/profile" },
];

const bottomNav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: PlusCircle, label: "Create", href: "/create", isCreate: true },
  { icon: ShoppingBag, label: "Shop", href: "/marketplace" },
  { icon: User, label: "Me", href: "/profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, hydrated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  // Subscribe to real-time unread message count
  const prevUnreadRef = useRef(0);
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    const unsubscribe = subscribeToUnreadCount(currentUser.username, (count) => {
      setUnreadCount(count);
      // Show browser notification when new messages arrive (and not on messages page)
      if (count > prevUnreadRef.current && pathname !== "/messages" && "Notification" in window && Notification.permission === "granted") {
        const newCount = count - prevUnreadRef.current;
        try {
          new Notification("New message", {
            body: `You have ${newCount} new message${newCount > 1 ? "s" : ""}`,
            icon: "/icons/icon-192.png",
          });
        } catch {
          // Ignore notification errors
        }
      }
      prevUnreadRef.current = count;
    });
    return () => unsubscribe();
  }, [currentUser, pathname]);

  // Request notification permission on first load
  useEffect(() => {
    if (currentUser && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [currentUser]);

  // Update notification and live stream counts
  useEffect(() => {
    if (!currentUser) {
      setNotifCount(0);
      setLiveCount(0);
      return;
    }
    const updateCounts = () => {
      setNotifCount(getUnreadCount(currentUser.username));
      setLiveCount(getActiveStreams().length);
    };
    updateCounts();
    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [hydrated, currentUser, router]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (!hydrated || !currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-vox-bg gap-4">
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          src="/voxel-logo.svg"
          alt="VOXel"
          className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen app-height bg-vox-bg overflow-hidden">
      {/* ═══════ DESKTOP SIDEBAR ═══════ */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 border-r border-white/[0.06] bg-vox-bg transition-all duration-300 ${
          sidebarCollapsed ? "w-[72px]" : "w-[240px]"
        }`}
        style={{ paddingTop: "var(--safe-top)" }}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
          <Link href="/" className="flex items-center gap-2 shrink-0 select-none">
            <img
              src="/voxel-logo.svg"
              alt="VOXel"
              className={`object-contain drop-shadow-lg ${sidebarCollapsed ? "w-9 h-9" : "w-8 h-8"}`}
            />
            {!sidebarCollapsed && (
              <span className="text-white font-bold text-lg tracking-tight hidden xl:inline">VOXel</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(true)} className="ml-auto text-vox-muted hover:text-white transition-colors p-1">
              <Menu className="w-4 h-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-vox-panel border border-white/10 flex items-center justify-center text-vox-muted hover:text-white transition-colors z-50">
              <Menu className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 relative ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-vox-muted hover:text-white hover:bg-white/[0.04]"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-vox-purple to-vox-pink"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-vox-pink" : ""}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.label === "Messages" && unreadCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-vox-pink to-vox-purple text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount}
                      </span>
                    )}
                    {item.label === "Alerts" && notifCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-vox-pink to-vox-purple text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {notifCount}
                      </span>
                    )}
                    {item.label === "LIVE" && liveCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-vox-danger text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {liveCount}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && (
                  <>
                    {item.label === "Messages" && unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-vox-pink" />
                    )}
                    {item.label === "Alerts" && notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-vox-pink" />
                    )}
                    {item.label === "LIVE" && liveCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-vox-danger" />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {/* Create Button */}
          <Link
            href="/create"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 mt-2 transition-all duration-200 btn-gradient ${
              sidebarCollapsed ? "justify-center px-0 mx-1" : ""
            }`}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-semibold">Create</span>}
          </Link>
        </nav>

        {/* Bottom section */}
        <div className={`border-t border-white/[0.06] py-3 px-2 space-y-1 ${sidebarCollapsed ? "items-center" : ""}`}>
          {/* User mini profile */}
          <Link href="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors ${sidebarCollapsed ? "justify-center px-0" : ""}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, #7C2CFF, #FF2C91)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentUser?.avatar || "/profiles/justwearwigs/avatar.jpeg"} alt={currentUser?.name || "Guest"} className="w-full h-full object-cover" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser?.name || "Guest"}</p>
                <p className="text-[11px] text-vox-muted truncate">@{currentUser?.username || "guest"}</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"} pb-16 lg:pb-0 overflow-hidden`}>
        <div className="h-full overflow-y-auto -webkit-overflow-scrolling-touch page-enter" key={pathname}>
          {children}
        </div>
      </main>

      {/* ═══════ MOBILE BOTTOM NAV ═══════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-vox-bg/95 backdrop-blur-xl border-t border-white/[0.06]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all touch-feedback ${
                  item.isCreate ? "" : active ? "text-white" : "text-vox-muted"
                }`}
              >
                {item.isCreate ? (
                  <div className="w-12 h-12 -mt-5 transition-transform active:scale-95">
                    <img
                      src="/voxel-logo.svg"
                      alt="Create"
                      className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,44,145,0.4)]"
                    />
                  </div>
                ) : (
                  <>
                    {active && (
                      <motion.div
                        layoutId="bottomnav-active"
                        className="absolute top-0 w-8 h-[2px] rounded-full bg-gradient-to-r from-vox-purple to-vox-pink"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 ${active ? "text-vox-pink" : ""}`} />
                    <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
