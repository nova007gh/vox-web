"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
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
  { icon: Radio, label: "LIVE", href: "/live", matchPrefix: "/live", badge: "3" },
  { icon: MessageCircle, label: "Messages", href: "/messages", matchPrefix: "/messages", badge: "5" },
  { icon: Bell, label: "Alerts", href: "/notifications", matchPrefix: "/notifications", badge: "12" },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

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
          <Link href="/" className="flex items-center gap-0 shrink-0 select-none">
            <span className={`font-bold tracking-tight ${sidebarCollapsed ? "text-lg" : "text-xl"}`}>
              <span className="text-white">V</span>
              <span className="relative inline-block">
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: "1.1em", height: "1.1em",
                    background: "linear-gradient(135deg, #FF8A34, #FF6A1A)",
                    verticalAlign: "middle", lineHeight: 0, position: "relative", top: "-0.05em",
                  }}
                >
                  <svg width="0.45em" height="0.5em" viewBox="0 0 10 12" fill="none" style={{ marginLeft: "0.08em" }}>
                    <path d="M1 1.5V10.5C1 11.1667 1.6 11.5 2 11.5L9 6.5C9.66667 6 9.66667 5.5 9 5L2 0.5C1.5 0.166667 1 0.5 1 1.5Z" fill="white" />
                  </svg>
                </span>
              </span>
              <span className="bg-clip-text text-transparent" style={{ background: "linear-gradient(135deg, #FF2C91, #FF8A34)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>X</span>
              {!sidebarCollapsed && <span className="text-white">el</span>}
            </span>
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
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-vox-pink to-vox-purple text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-vox-pink" />
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
                  <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center -mt-4 shadow-lg shadow-vox-pink/30">
                    <PlusCircle className="w-5 h-5 text-white" />
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
