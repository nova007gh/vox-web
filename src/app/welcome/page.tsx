"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Video,
  Users,
  DollarSign,
  ShoppingBag,
  Wallet,
  Radio,
  Bot,
  Shield,
  Play,
  Download,
  Globe,
  ChevronRight,
  Heart,
  Eye,
  Star,
  Lock,
  CheckCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  ANIMATION HELPERS                                                  */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChild({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Video,
    title: "Create & Share",
    desc: "Post videos, go live, and grow your audience.",
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20",
  },
  {
    icon: Users,
    title: "Connect",
    desc: "Build real connections with communities that matter.",
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
  },
  {
    icon: DollarSign,
    title: "Earn",
    desc: "Monetize your content, get gifts, and earn rewards.",
    color: "from-yellow-400 to-green-400",
    shadow: "shadow-yellow-400/20",
  },
  {
    icon: ShoppingBag,
    title: "Shop",
    desc: "Discover amazing products and support local businesses.",
    color: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20",
  },
  {
    icon: Wallet,
    title: "VOX Wallet",
    desc: "Send, receive, and manage money securely.",
    color: "from-emerald-400 to-green-500",
    shadow: "shadow-emerald-400/20",
  },
  {
    icon: Radio,
    title: "Live",
    desc: "Go live, engage your fans, and broadcast your passion.",
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-400/20",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Your smart assistant for discovery and everyday help.",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-400/20",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    desc: "Advanced AI protection keeps you safe from scams and fakes.",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
];

const stats = [
  { value: "1M+", label: "Active Users", icon: Users, color: "text-vox-pink" },
  {
    value: "50M+",
    label: "Videos Created",
    icon: Video,
    color: "text-vox-orange",
  },
  {
    value: "10M+",
    label: "Products Sold",
    icon: ShoppingBag,
    color: "text-rose-500",
  },
  {
    value: "$100M+",
    label: "Paid to Creators",
    icon: DollarSign,
    color: "text-vox-green",
  },
  {
    value: "150+",
    label: "Countries",
    icon: Globe,
    color: "text-vox-cyan",
  },
  {
    value: "100%",
    label: "Secure Platform",
    icon: Lock,
    color: "text-violet-400",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="relative min-h-screen app-min-height bg-vox-bg overflow-hidden safe-top">
      <Navbar />

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* --- ambient glow blobs --- */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-purple-600/20 blur-[160px] animate-pulse-glow" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-pink-600/15 blur-[140px] animate-pulse-glow [animation-delay:1.5s]" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full bg-orange-500/10 blur-[120px] animate-pulse-glow [animation-delay:3s]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* ---------- LEFT: COPY ---------- */}
          <div className="flex flex-col gap-8 z-10">
            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold tracking-widest uppercase text-vox-muted border border-white/10">
                <Star size={14} className="text-vox-orange" />
                The All-in-One Super App
              </span>
            </motion.div>

            {/* heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight"
            >
              Create. Connect.
              <br />
              <span className="text-gradient">Earn.</span>
            </motion.h1>

            {/* subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-vox-muted text-base md:text-lg lg:text-xl leading-relaxed max-w-xl"
            >
              VOXel is the ultimate platform for creators, shoppers, and
              dreamers. Share your world, discover new opportunities, shop, make
              payments, and grow your brand&nbsp;&mdash; all in one place.
            </motion.p>

            {/* buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#download"
                className="btn-gradient rounded-full px-6 py-3 text-base font-semibold touch-feedback text-white flex items-center gap-2.5"
              >
                <Download size={18} />
                Get Started
              </a>
              <a
                href="/auth"
                className="glass rounded-full px-6 py-3 text-base font-semibold touch-feedback text-white flex items-center gap-2.5"
              >
                <Play size={18} className="text-vox-pink" />
                Sign In
              </a>
            </motion.div>

            {/* store badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-4 mt-2"
            >
              {["Google Play", "App Store"].map((store) => (
                <div
                  key={store}
                  className="glass rounded-xl px-5 py-3 flex items-center gap-3 cursor-pointer card-hover touch-feedback"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {store === "Google Play" ? (
                      <Play size={16} className="text-vox-green" />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-vox-muted leading-none block">
                      {store === "Google Play" ? "GET IT ON" : "Download on the"}
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      {store}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ---------- RIGHT: PHONE MOCKUPS ---------- */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center lg:justify-end z-10"
          >
            <div className="relative w-full max-w-[520px] h-[540px] md:h-[600px]">
              {/* Phone 1 - Video Feed (center, tallest) */}
              <div className="phone-glow absolute left-1/2 -translate-x-1/2 top-0 w-[220px] md:w-[240px] h-[440px] md:h-[480px] rounded-[2.5rem] gradient-border glass-strong overflow-hidden z-30">
                <div className="absolute inset-[1px] rounded-[2.5rem] bg-vox-bg overflow-hidden">
                  {/* status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-1">
                    <span className="text-[10px] text-white/60">9:41</span>
                    <div className="w-20 h-5 rounded-full bg-black" />
                    <div className="flex gap-1">
                      <div className="w-3.5 h-2 rounded-sm bg-white/40" />
                    </div>
                  </div>
                  {/* video feed mock */}
                  <div className="relative h-full bg-gradient-to-b from-purple-900/40 via-vox-bg to-pink-900/30">
                    {/* fake video thumbnail gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-800/30 via-transparent to-pink-700/20" />
                    {/* creator overlay */}
                    <div className="absolute bottom-24 left-4 right-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vox-pink to-vox-orange" />
                        <div>
                          <p className="text-xs font-bold">@amara.creates</p>
                          <p className="text-[10px] text-white/50">Accra, Ghana</p>
                        </div>
                        <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full btn-gradient">
                          Follow
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        Golden hour vibes in Accra&nbsp;
                        <span className="text-vox-cyan">#VOXel</span>
                      </p>
                    </div>
                    {/* side actions */}
                    <div className="absolute bottom-28 right-3 flex flex-col gap-4 items-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <Heart size={20} className="text-vox-pink" />
                        <span className="text-[9px] text-white/60">12.4K</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="w-5 h-5 text-white/70"
                        >
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        <span className="text-[9px] text-white/60">843</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Eye size={18} className="text-white/70" />
                        <span className="text-[9px] text-white/60">58K</span>
                      </div>
                    </div>
                    {/* bottom nav mock */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-black/60 backdrop-blur-sm flex items-center justify-around px-4 border-t border-white/5">
                      {[
                        { icon: "home", active: true },
                        { icon: "search" },
                        { icon: "plus" },
                        { icon: "bag" },
                        { icon: "user" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-md ${
                            item.icon === "plus"
                              ? "btn-gradient rounded-lg w-8 h-8"
                              : ""
                          } ${
                            item.active
                              ? "bg-white/20"
                              : "bg-white/5"
                          } flex items-center justify-center`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone 2 - Wallet (left, shorter) */}
              <div className="phone-glow absolute left-0 top-16 md:top-12 w-[180px] md:w-[200px] h-[370px] md:h-[400px] rounded-[2rem] gradient-border glass-strong overflow-hidden z-20 -rotate-6">
                <div className="absolute inset-[1px] rounded-[2rem] bg-vox-bg overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-[10px] text-white/60">9:41</span>
                    <div className="w-16 h-4 rounded-full bg-black" />
                    <div className="w-3 h-2 rounded-sm bg-white/40" />
                  </div>
                  <div className="p-4 pt-3">
                    <p className="text-[10px] text-vox-muted mb-1">VOX Wallet</p>
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-vox-panel to-cyan-500/10 p-4 mb-3 border border-white/5">
                      <p className="text-[9px] text-white/50 mb-0.5">
                        Total Balance
                      </p>
                      <p className="text-2xl font-bold text-white tracking-tight">
                        GHS 5,680
                        <span className="text-vox-green">.45</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle size={10} className="text-vox-green" />
                        <span className="text-[9px] text-vox-green">
                          +12.4% this month
                        </span>
                      </div>
                    </div>
                    {/* quick actions */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Send", color: "from-blue-500 to-cyan-500" },
                        { label: "Receive", color: "from-green-500 to-emerald-500" },
                        { label: "Pay", color: "from-orange-500 to-amber-500" },
                      ].map((action) => (
                        <div
                          key={action.label}
                          className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.color} opacity-80`}
                          />
                          <span className="text-[8px] text-white/60">
                            {action.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* transactions */}
                    <p className="text-[9px] text-white/40 mb-2">Recent</p>
                    {[
                      {
                        name: "Kofi Store",
                        amount: "-GHS 45.00",
                        color: "text-red-400",
                      },
                      {
                        name: "Gift Received",
                        amount: "+GHS 120.00",
                        color: "text-vox-green",
                      },
                      {
                        name: "VOX Earnings",
                        amount: "+GHS 580.00",
                        color: "text-vox-green",
                      },
                    ].map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/10" />
                          <span className="text-[9px] text-white/70">
                            {tx.name}
                          </span>
                        </div>
                        <span className={`text-[9px] font-semibold ${tx.color}`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone 3 - Marketplace (right, shorter) */}
              <div className="phone-glow absolute right-0 top-16 md:top-12 w-[180px] md:w-[200px] h-[370px] md:h-[400px] rounded-[2rem] gradient-border glass-strong overflow-hidden z-20 rotate-6">
                <div className="absolute inset-[1px] rounded-[2rem] bg-vox-bg overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-[10px] text-white/60">9:41</span>
                    <div className="w-16 h-4 rounded-full bg-black" />
                    <div className="w-3 h-2 rounded-sm bg-white/40" />
                  </div>
                  <div className="p-4 pt-3">
                    <p className="text-[10px] text-vox-muted mb-2">
                      Marketplace
                    </p>
                    {/* search bar mock */}
                    <div className="rounded-xl bg-white/5 px-3 py-2 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                      <span className="text-[9px] text-white/30">
                        Search products...
                      </span>
                    </div>
                    {/* product grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          name: "African Print Bag",
                          price: "GHS 89",
                          gradient: "from-orange-600/30 to-amber-700/20",
                        },
                        {
                          name: "Shea Butter Set",
                          price: "GHS 45",
                          gradient: "from-pink-600/30 to-rose-700/20",
                        },
                        {
                          name: "Handmade Beads",
                          price: "GHS 120",
                          gradient: "from-purple-600/30 to-violet-700/20",
                        },
                        {
                          name: "Kente Cloth",
                          price: "GHS 250",
                          gradient: "from-emerald-600/30 to-green-700/20",
                        },
                      ].map((product) => (
                        <div
                          key={product.name}
                          className="rounded-xl overflow-hidden bg-white/5"
                        >
                          <div
                            className={`h-16 bg-gradient-to-br ${product.gradient}`}
                          />
                          <div className="p-1.5">
                            <p className="text-[8px] text-white/70 leading-tight truncate">
                              {product.name}
                            </p>
                            <p className="text-[9px] font-bold text-vox-orange">
                              {product.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating glow behind phones */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-vox-purple/20 blur-[100px] pointer-events-none" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-vox-pink/15 blur-[80px] pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section id="features" className="relative py-24 md:py-32">
        {/* subtle glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-purple-600/8 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold tracking-widest uppercase text-vox-muted border border-white/10 mb-4">
              <CheckCircle size={14} className="text-vox-green" />
              Everything You Need
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-4">
              One App.{" "}
              <span className="text-gradient">Infinite Possibilities.</span>
            </h2>
            <p className="text-vox-muted text-lg mt-4 max-w-2xl mx-auto">
              From content creation to commerce, from wallets to live streaming
              &mdash; VOXel brings everything together in one beautiful
              experience.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <StaggerChild key={feature.title} index={i}>
                  <div className="glass rounded-2xl p-4 card-hover touch-feedback group h-full">
                    {/* icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-vox-muted text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </StaggerChild>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS                                                       */}
      {/* ============================================================ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-purple-700/10 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-pink-700/8 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Trusted by{" "}
              <span className="text-gradient">Millions Worldwide</span>
            </h2>
            <p className="text-vox-muted text-base mt-3 max-w-xl mx-auto">
              Join a thriving global community that&apos;s creating, connecting,
              and earning every day.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <StaggerChild key={stat.label} index={i}>
                  <div className="glass rounded-2xl p-5 text-center card-hover touch-feedback">
                    <div
                      className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 ${stat.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-vox-muted text-xs mt-1 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </StaggerChild>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* dramatic glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-purple-600/15 blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold tracking-widest uppercase text-vox-muted border border-white/10 mb-6">
              <Globe size={14} className="text-vox-cyan" />
              Available Worldwide
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              It&apos;s more than an app.
              <br />
              <span className="text-gradient">It&apos;s a movement.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-vox-muted text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              Create without limits. Connect without borders. Earn without
              boundaries.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#download"
                className="btn-gradient px-10 py-4 rounded-full text-white font-bold text-base flex items-center gap-3 shadow-lg shadow-pink-500/20 touch-feedback"
              >
                Join VOXel Today
                <ChevronRight size={20} />
              </a>
            </div>
          </AnimatedSection>

          {/* floating decorations */}
          <div className="mt-16 flex items-center justify-center gap-3 flex-wrap">
            {[
              "Social Media",
              "Live Streaming",
              "Marketplace",
              "Wallet",
              "AI Assistant",
              "Creator Economy",
            ].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full glass text-xs font-medium text-vox-muted border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center font-bold text-xs">
              V
            </div>
            <div>
              <p className="text-sm font-semibold">
                VOX<span className="text-vox-muted font-normal">el</span>
              </p>
              <p className="text-[11px] text-vox-muted leading-snug max-w-xs">
                VOX is the public-facing brand of VOXel, Developed and Operated
                by SmartThinkers&trade; Tech
              </p>
            </div>
          </div>

          {/* links */}
          <div className="flex items-center gap-6 text-xs text-vox-muted">
            <a href="#" className="hover:text-white transition-colors touch-feedback">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors touch-feedback">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors touch-feedback">
              Support
            </a>
            <a href="#" className="hover:text-white transition-colors touch-feedback">
              Careers
            </a>
          </div>

          {/* availability */}
          <div className="flex items-center gap-2 text-xs text-vox-muted">
            <Globe size={14} className="text-vox-cyan" />
            Available in 150+ countries
          </div>
        </div>

        <div className="border-t border-white/5 py-6 text-center">
          <p className="text-xs text-vox-muted/60">
            &copy; {new Date().getFullYear()} VOXel by SmartThinkers&trade;
            Tech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
