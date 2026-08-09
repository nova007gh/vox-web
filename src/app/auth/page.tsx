"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  Phone,
  Globe,
  ChevronDown,
  Users,
  ShoppingBag,
  Wallet,
  Play,
  Shield,
  CheckCircle2,
  Heart,
  Star,
  TrendingUp,
  ShieldCheck,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { VOXelLogo } from "@/components/VOXelLogo";

/* ──────────────────────────── constants ──────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.07, duration: 0.5 },
  }),
};

const features = [
  {
    icon: Users,
    title: "Connect",
    desc: "Build real connections and join communities that matter.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/15",
    ring: "ring-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    icon: ShoppingBag,
    title: "Shop",
    desc: "Discover amazing products and support local businesses.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-500/15",
    ring: "ring-orange-500/30",
    iconColor: "text-orange-400",
  },
  {
    icon: Wallet,
    title: "VOX Wallet",
    desc: "Send, receive, and manage money securely.",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    icon: Play,
    title: "Create",
    desc: "Share your stories, go live, and grow your audience.",
    color: "from-pink-500 to-fuchsia-500",
    bg: "bg-pink-500/15",
    ring: "ring-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    desc: "Advanced AI protection keeps you safe from scams and fakes.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/15",
    ring: "ring-violet-500/30",
    iconColor: "text-violet-400",
  },
];

/* ──────────────────────────── component ──────────────────────────── */

export default function AuthPage() {
  /* ── auth ── */
  const { login, signup, currentUser, hydrated } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  /* ── redirect if already logged in (wait for hydration) ── */
  useEffect(() => {
    if (hydrated && currentUser) {
      router.push("/");
    }
  }, [hydrated, currentUser, router]);

  /* ── form state ── */
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  /* ── phone login state ── */
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [otpCode, setOtpCode] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const handlePhoneLogin = () => {
    setPhoneError(null);
    if (phoneStep === "phone") {
      if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 9) {
        setPhoneError("Please enter a valid phone number");
        return;
      }
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPhoneStep("otp");
    } else {
      // Verify OTP
      if (otpCode.length !== 6) {
        setPhoneError("Please enter the 6-digit code");
        return;
      }
      if (otpCode !== generatedOtp) {
        setPhoneError("Invalid code. Please try again.");
        return;
      }
      // Create a phone-based account and log in
      const phoneUsername = "phone_" + phoneNumber.replace(/\D/g, "").slice(-6);
      const result = signup({
        name: "Phone User",
        username: phoneUsername,
        email: phoneUsername + "@vox.el",
        password: "phone_" + generatedOtp,
        bio: "Joined via phone",
      });
      if (result.success) {
        setShowPhoneModal(false);
        router.push("/");
      } else {
        // If signup fails (duplicate), try logging in
        const loginResult = login(phoneUsername + "@vox.el", "phone_" + generatedOtp);
        if (loginResult.success) {
          setShowPhoneModal(false);
          router.push("/");
        } else {
          setPhoneError("Could not complete phone login. Please try again.");
        }
      }
    }
  };

  const handleSocialClick = (provider: string) => {
    setAuthError(`${provider} login is coming soon! Please use email sign in for now.`);
  };

  const resetPhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneNumber("");
    setOtpCode("");
    setPhoneStep("phone");
    setPhoneError(null);
    setGeneratedOtp("");
  };

  /* ── password strength ── */
  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password),
    }),
    [password]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      if (mode === "signin") {
        const result = login(email, password);
        if (result.success) {
          router.push("/");
        } else {
          setAuthError(result.error || "Login failed");
        }
      } else {
        if (!agreed) {
          setAuthError("Please agree to the Terms & Privacy Policy");
          return;
        }
        const result = signup({
          name: fullName,
          username: username || email.split("@")[0],
          email,
          password,
          bio: "",
        });
        if (result.success) {
          router.push("/");
        } else {
          setAuthError(result.error || "Signup failed");
        }
      }
    },
    [fullName, username, email, password, agreed, mode, login, signup, router]
  );

  /* ────────────────────── render ────────────────────── */
  return (
    <div className="h-screen app-height flex bg-vox-bg overflow-hidden">
      {/* ═══════════════════  LEFT SIDE  ═══════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#120829] via-vox-bg to-[#0a0c1a]" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-vox-purple/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-vox-pink/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-vox-orange/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

        {/* content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* ── Logo ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-12"
          >
            <Link href="/" className="flex items-center gap-3 select-none">
              <VOXelLogo variant="loading" size={48} />
              <span className="text-2xl font-bold tracking-tight text-white hidden sm:inline">VOXel</span>
            </Link>
          </motion.div>

          {/* ── Headings ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mb-8"
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight">
              <span className="text-white">Create Without Limits.</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                Connect
              </span>
              <span className="text-white"> Without Borders.</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Earn
              </span>
              <span className="text-white"> Without Boundaries.</span>
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-vox-muted text-base xl:text-lg max-w-lg leading-relaxed mb-10"
          >
            Join millions of creators, shoppers, and dreamers on VOXel — the
            all-in-one platform to share, shop, pay, and grow.
          </motion.p>

          {/* ── Feature list ── */}
          <div className="space-y-4 mb-10">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i + 3}
                className="flex items-start gap-4 group"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl ${f.bg} ring-1 ${f.ring} flex items-center justify-center`}
                >
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-vox-muted text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Phone mockup ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={9}
            className="mt-auto"
          >
            <div className="relative max-w-[260px]">
              {/* phone frame */}
              <div className="relative w-full aspect-[9/16] max-h-[340px] rounded-[28px] glass-strong overflow-hidden phone-glow">
                {/* top bar */}
                <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-center">
                  <div className="w-20 h-5 bg-black rounded-b-2xl" />
                </div>

                {/* screen content */}
                <div className="absolute inset-3 top-10 flex flex-col items-center justify-center gap-3">
                  {/* mini logo */}
                  <VOXelLogo variant="loading" size={56} />
                  <span className="text-white font-bold text-lg tracking-tight">
                    VOXel
                  </span>
                  <span className="text-vox-muted text-[11px] text-center leading-snug">
                    Create. Connect. Earn.
                  </span>

                  {/* mini feed cards */}
                  <div className="w-full space-y-2 mt-3">
                    {[
                      {
                        icon: Heart,
                        label: "Feed",
                        color: "from-pink-500/20 to-rose-500/20",
                      },
                      {
                        icon: Star,
                        label: "Marketplace",
                        color: "from-orange-500/20 to-amber-500/20",
                      },
                      {
                        icon: TrendingUp,
                        label: "Wallet",
                        color: "from-emerald-500/20 to-green-500/20",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`w-full h-9 rounded-xl bg-gradient-to-r ${item.color} border border-white/5 flex items-center gap-2 px-3`}
                      >
                        <item.icon className="w-3.5 h-3.5 text-white/60" />
                        <span className="text-white/70 text-[11px] font-medium">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* available text */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={11}
              className="flex items-center gap-2 mt-5"
            >
              <Globe className="w-4 h-4 text-vox-muted" />
              <span className="text-vox-muted text-xs">
                Available in 150+ countries
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════  RIGHT SIDE  ═══════════════════ */}
      <div className="flex-1 flex justify-center px-4 sm:px-8 safe-top safe-bottom py-6 lg:py-6 overflow-y-auto scroll-y relative">
        {/* mobile background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-vox-purple/15 blur-[120px] animate-pulse-glow" />
          <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] rounded-full bg-vox-pink/10 blur-[100px] animate-pulse-glow [animation-delay:1.5s]" />
          <div className="absolute bottom-0 left-1/2 w-[350px] h-[250px] rounded-full bg-vox-orange/8 blur-[100px] animate-pulse-glow [animation-delay:3s]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md lg:my-auto relative z-10"
        >
          {/* panel wrapper */}
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            {/* ── header row ── */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                </h2>
                <p className="text-vox-muted text-sm mt-1">
                  {mode === "signup"
                    ? "Join VOXel and be part of the movement."
                    : "Sign in to continue to VOXel."}
                </p>
              </div>

              {/* language selector */}
              <button className="flex items-center gap-1.5 text-vox-muted hover:text-white transition-colors text-sm bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10 touch-feedback">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">EN</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* ── mobile logo ── */}
            <div className="flex lg:hidden flex-col items-center justify-center mb-6">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-white">V</span>
                <span className="relative inline-flex items-center justify-center">
                  <span className="text-vox-orange">O</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-[16px] h-[16px] rounded-full border-2 border-vox-orange flex items-center justify-center">
                      <Play className="w-1.5 h-1.5 text-vox-orange fill-vox-orange ml-[1px]" />
                    </span>
                  </span>
                </span>
                <span className="text-gradient">X</span>
                <span className="text-white">el</span>
              </span>
              <span className="text-sm text-vox-muted mt-1">Create. Connect. Earn.</span>
            </div>

            {/* ── tab switch ── */}
            <div className="glass rounded-full p-1 flex mb-6">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold touch-feedback transition-all ${
                  mode === "signup"
                    ? "bg-white/10 text-white"
                    : "text-vox-muted"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold touch-feedback transition-all ${
                  mode === "signin"
                    ? "bg-white/10 text-white"
                    : "text-vox-muted"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* ── social auth buttons ── */}
            <div className="space-y-3 mb-6">
              {/* Google */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                type="button"
                onClick={() => handleSocialClick("Google")}
                className="w-full flex items-center justify-center gap-2 glass rounded-2xl py-3 text-sm font-medium text-white touch-feedback transition-all duration-200"
              >
                {/* Google G icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </motion.button>

              {/* Apple */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                type="button"
                onClick={() => handleSocialClick("Apple")}
                className="w-full flex items-center justify-center gap-2 glass rounded-2xl py-3 text-sm font-medium text-white touch-feedback transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </motion.button>

              {/* Facebook */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                type="button"
                onClick={() => handleSocialClick("Facebook")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 bg-[#1877F2] hover:bg-[#1565D8] border border-[#1877F2]/50 text-sm font-medium text-white touch-feedback transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </motion.button>

              {/* Phone */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                type="button"
                onClick={() => { resetPhoneModal(); setShowPhoneModal(true); }}
                className="w-full flex items-center justify-center gap-2 glass rounded-2xl py-3 text-sm font-medium text-white touch-feedback transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone
              </motion.button>
            </div>

            {/* ── OR divider ── */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-vox-muted text-xs font-medium">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              {mode === "signup" && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                >
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* Username */}
              {mode === "signup" && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={6}
                >
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                    <input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={7}
              >
                <label className="block text-sm font-medium text-white mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={8}
              >
                <label className="block text-sm font-medium text-white mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-vox-muted hover:text-white transition-colors touch-feedback"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Password requirements */}
              {mode === "signup" && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs"
                >
                  {[
                    { label: "8+ characters", met: passwordChecks.length },
                    { label: "1 number", met: passwordChecks.number },
                    { label: "1 special character", met: passwordChecks.special },
                  ].map((req) => (
                    <span
                      key={req.label}
                      className={`flex items-center gap-1.5 transition-colors ${
                        req.met ? "text-vox-green" : "text-vox-muted/60"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          req.met ? "text-vox-green" : "text-vox-muted/40"
                        }`}
                      />
                      {req.label}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Terms checkbox */}
              {mode === "signup" && (
              <motion.label
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={9}
                className="flex items-start gap-3 cursor-pointer select-none touch-feedback"
              >
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border border-white/20 bg-white/5 peer-checked:bg-vox-purple peer-checked:border-vox-purple transition-all flex items-center justify-center">
                    {agreed && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-vox-muted leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-vox-purple hover:text-vox-purple/80 underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-vox-purple hover:text-vox-purple/80 underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </motion.label>
              )}

              {/* Auth error */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl px-4 py-2.5 text-xs text-red-400 border border-red-400/20"
                >
                  {authError}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={10}
                type="submit"
                disabled={
                  mode === "signup"
                    ? !agreed ||
                      !fullName ||
                      !username ||
                      !email ||
                      !passwordChecks.length ||
                      !passwordChecks.number ||
                      !passwordChecks.special
                    : !email || !password
                }
                className="w-full btn-gradient rounded-2xl py-3 text-base font-semibold text-white touch-feedback disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none transition-all"
              >
                {mode === "signup" ? "Sign Up" : "Sign In"}
              </motion.button>
            </form>

            {/* ── toggle links ── */}
            {mode === "signin" && (
              <div className="text-center mt-4">
                <Link
                  href="/auth/forgot"
                  className="text-xs text-vox-muted touch-feedback inline-block"
                >
                  Forgot password?{" "}
                  <span className="text-vox-pink font-medium">Reset it</span>
                </Link>
              </div>
            )}
            <p className="text-center text-xs text-vox-muted mt-5">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-vox-pink font-medium touch-feedback"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-vox-pink font-medium touch-feedback"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>

            {/* ── Security badge ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={12}
              className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-vox-green/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-vox-green" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    Your Safety. Our Priority.
                  </p>
                  <p className="text-vox-muted text-xs leading-relaxed mt-0.5">
                    Advanced AI safety, identity verification, and 24/7 security
                    monitoring.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Bottom trust badges ── */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={13}
              className="mt-5 grid grid-cols-3 gap-3"
            >
              {[
                {
                  icon: Lock,
                  label: "Secure & Private",
                  iconColor: "text-vox-purple",
                  bgColor: "bg-vox-purple/10",
                },
                {
                  icon: Shield,
                  label: "Trusted Platform",
                  iconColor: "text-vox-pink",
                  bgColor: "bg-vox-pink/10",
                },
                {
                  icon: Settings,
                  label: "Your Control",
                  iconColor: "text-vox-orange",
                  bgColor: "bg-vox-orange/10",
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${badge.bgColor} flex items-center justify-center`}
                  >
                    <badge.icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                  </div>
                  <span className="text-vox-muted text-[10px] font-medium text-center leading-tight">
                    {badge.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════ PHONE LOGIN MODAL ═══════════════════ */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={resetPhoneModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[85vh] overflow-y-auto scroll-y"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-vox-purple/15 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-vox-purple" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {phoneStep === "phone" ? "Phone Login" : "Verify Code"}
                </h2>
              </div>
              <button
                onClick={resetPhoneModal}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-vox-muted hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {phoneStep === "phone" ? (
              <>
                <p className="text-sm text-vox-muted mb-4">
                  Enter your phone number and we&apos;ll send you a verification code.
                </p>
                <div className="relative mb-4">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                  <input
                    type="tel"
                    placeholder="+233 24 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneLogin()}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-vox-muted mb-2">
                  We sent a 6-digit code to <span className="text-white font-medium">{phoneNumber}</span>
                </p>
                <p className="text-xs text-vox-cyan mb-4">
                  Demo code: <span className="font-mono font-bold">{generatedOtp}</span>
                </p>
                <div className="relative mb-4">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vox-muted" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneLogin()}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-2xl font-mono tracking-[0.5em] text-center placeholder:text-vox-muted/40 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPhoneStep("phone")}
                  className="text-xs text-vox-muted hover:text-white transition mb-3"
                >
                  ← Change phone number
                </button>
              </>
            )}

            {phoneError && (
              <div className="glass rounded-xl px-4 py-2.5 text-xs text-red-400 border border-red-400/20 mb-4">
                {phoneError}
              </div>
            )}

            <button
              onClick={handlePhoneLogin}
              className="w-full btn-gradient rounded-2xl py-3 text-base font-semibold text-white touch-feedback transition-all"
            >
              {phoneStep === "phone" ? "Send Code" : "Verify & Continue"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
