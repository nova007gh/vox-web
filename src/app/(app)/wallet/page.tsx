"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Eye,
  EyeOff,
  Plus,
  Send,
  Smartphone,
  Landmark,
  CreditCard,
  QrCode,
  Link2,
  ArrowDownToLine,
  ShieldCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Coins,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  X,
  Copy,
  Building2,
  Zap,
  Droplet,
  Wifi,
  Phone,
} from "lucide-react";

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ── static data ── */
const quickActions = [
  { icon: Smartphone, label: "Mobile Money", color: "from-yellow-500 to-orange-500" },
  { icon: Landmark, label: "Bank Transfer", color: "from-blue-500 to-cyan-500" },
  { icon: CreditCard, label: "Cards", color: "from-purple-500 to-pink-500" },
  { icon: Receipt, label: "Pay Bills", color: "from-green-500 to-emerald-500" },
];

const giftTiers = [
  { emoji: "❤️", name: "Heart", cost: 50 },
  { emoji: "🌹", name: "Rose", cost: 100 },
  { emoji: "🔥", name: "Fire", cost: 200 },
  { emoji: "💎", name: "Diamond", cost: 500 },
  { emoji: "🚀", name: "Rocket", cost: 1000 },
  { emoji: "👑", name: "King", cost: 5000 },
];

const paymentMethods = [
  { icon: Smartphone, label: "Mobile Money", desc: "MTN MoMo, Telecel", color: "#FF8A34" },
  { icon: Landmark, label: "Bank Transfer", desc: "All major banks", color: "#3B82F6" },
  { icon: CreditCard, label: "Debit/Credit Cards", desc: "Visa, Mastercard", color: "#7C2CFF" },
  { icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  ), label: "Apple Pay", desc: "Tap to pay", color: "#FFFFFF" },
  { icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  ), label: "Google Pay", desc: "Fast checkout", color: "#2BE28A" },
  { icon: QrCode, label: "QR Pay", desc: "Scan & pay", color: "#23D8FF" },
  { icon: Link2, label: "Payment Link", desc: "Share & receive", color: "#FF2C91" },
  { icon: ArrowDownToLine, label: "Withdraw", desc: "Cash out", color: "#2BE28A" },
];

const allTransactions = [
  { label: "Transfer to Nana Ama", amount: "-GHS 200.00", type: "debit" as const, time: "Today 2:30 PM", icon: ArrowUpRight, status: "Completed", category: "Transfer" },
  { label: "Airtime Purchase", amount: "-GHS 50.00", type: "debit" as const, time: "Today 10:15 AM", icon: Smartphone, status: "Completed", category: "Airtime" },
  { label: "Payment from Abena", amount: "+GHS 150.00", type: "credit" as const, time: "Yesterday", icon: ArrowDownLeft, status: "Completed", category: "Transfer" },
  { label: "Marketplace Purchase", amount: "-GHS 120.00", type: "debit" as const, time: "Aug 3", icon: Receipt, status: "Completed", category: "Shopping" },
  { label: "Coin Purchase", amount: "500 VOX Coins", type: "coins" as const, time: "Aug 2", icon: Coins, status: "Completed", category: "Coins" },
  { label: "Gift Sent to Ama Vibes", amount: "-200 Coins", type: "debit" as const, time: "Aug 1", icon: Sparkles, status: "Completed", category: "Gift" },
  { label: "Live Auction Win", amount: "-GHS 450.00", type: "debit" as const, time: "Jul 30", icon: Receipt, status: "Completed", category: "Auction" },
  { label: "Creator Payout", amount: "+GHS 890.00", type: "credit" as const, time: "Jul 28", icon: ArrowDownLeft, status: "Completed", category: "Earnings" },
];

const securityFeatures = [
  "Biometric authentication",
  "AI-powered risk scoring",
  "Escrow protection",
  "Verified creator payouts",
  "Real-time fraud alerts",
];

const coinPackages = [
  { coins: 50, price: "GHS 2.00", bonus: "" },
  { coins: 100, price: "GHS 4.00", bonus: "+5 bonus" },
  { coins: 200, price: "GHS 8.00", bonus: "+15 bonus" },
  { coins: 500, price: "GHS 20.00", bonus: "+50 bonus" },
  { coins: 1000, price: "GHS 40.00", bonus: "+120 bonus" },
  { coins: 5000, price: "GHS 200.00", bonus: "+800 bonus" },
];

const rewardTiers = [
  { points: 500, coins: 50, badge: "", label: "50 VOX Coins" },
  { points: 1000, coins: 120, badge: "", label: "120 VOX Coins" },
  { points: 2000, coins: 300, badge: "", label: "300 VOX Coins" },
  { points: 5000, coins: 1000, badge: " + Premium Badge", label: "1000 VOX Coins + Premium Badge" },
];

const earnMethods = [
  { icon: "📺", label: "Watch videos", points: "+10 pts" },
  { icon: "📅", label: "Daily login", points: "+5 pts" },
  { icon: "🎁", label: "Send gifts", points: "+20 pts" },
  { icon: "🛒", label: "Marketplace purchases", points: "+15 pts" },
  { icon: "🏆", label: "Live stream participation", points: "+25 pts" },
  { icon: "👥", label: "Refer friends", points: "+100 pts" },
];

const billTypes = [
  { icon: Zap, label: "Electricity", color: "#FFB020" },
  { icon: Droplet, label: "Water", color: "#23D8FF" },
  { icon: Wifi, label: "Internet", color: "#7C2CFF" },
  { icon: Phone, label: "Airtime", color: "#2BE28A" },
];

/* ══════════════════════════════════════════════════════════════
   WALLET PAGE
   ══════════════════════════════════════════════════════════════ */
export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [balance, setBalance] = useState(5680.45);
  const [coinBalance, setCoinBalance] = useState(12500);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendRecipient, setSendRecipient] = useState("");
  const [selectedCoinPkg, setSelectedCoinPkg] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* ── new modal states ── */
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showApplePayModal, setShowApplePayModal] = useState(false);
  const [showGooglePayModal, setShowGooglePayModal] = useState(false);

  /* ── rewards state ── */
  const [rewardPoints, setRewardPoints] = useState(1250);

  /* ── mobile money state ── */
  const [momoPhone, setMomoPhone] = useState("");
  const [momoAmount, setMomoAmount] = useState("");

  /* ── card state ── */
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");

  /* ── google pay state ── */
  const [gpayAmount, setGpayAmount] = useState("");

  /* ── payment link state ── */
  const [linkAmount, setLinkAmount] = useState("");
  const [linkNote, setLinkNote] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  /* ── withdraw state ── */
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Mobile Money");

  /* ── bills state ── */
  const [selectedBill, setSelectedBill] = useState<number | null>(null);
  const [billAccount, setBillAccount] = useState("");
  const [billAmount, setBillAmount] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (amt > 0) {
      setBalance(balance + amt);
      showToast(`GHS ${amt.toFixed(2)} added successfully!`);
      setShowAddMoney(false);
      setAddAmount("");
    }
  };

  const handleSendMoney = () => {
    const amt = parseFloat(sendAmount);
    if (amt > 0 && sendRecipient && amt <= balance) {
      setBalance(balance - amt);
      showToast(`Sent GHS ${amt.toFixed(2)} to ${sendRecipient}`);
      setShowSendMoney(false);
      setSendAmount("");
      setSendRecipient("");
    } else if (amt > balance) {
      showToast("Insufficient balance!");
    }
  };

  const handleTopUp = () => {
    if (selectedCoinPkg !== null) {
      const pkg = coinPackages[selectedCoinPkg];
      setCoinBalance(coinBalance + pkg.coins + (pkg.bonus ? Math.floor(pkg.coins * 0.1) : 0));
      showToast(`${pkg.coins} coins purchased!`);
      setShowTopUp(false);
      setSelectedCoinPkg(null);
    }
  };

  const handleGift = (tier: typeof giftTiers[0]) => {
    if (coinBalance >= tier.cost) {
      setCoinBalance(coinBalance - tier.cost);
      showToast(`${tier.emoji} ${tier.name} sent! -${tier.cost} coins`);
    } else {
      showToast("Not enough coins! Top up first.");
    }
  };

  const handleRedeem = (tier: typeof rewardTiers[0]) => {
    if (rewardPoints >= tier.points) {
      setRewardPoints(rewardPoints - tier.points);
      setCoinBalance(coinBalance + tier.coins);
      showToast(`Redeemed! +${tier.coins} VOX Coins${tier.badge}`);
    } else {
      showToast("Not enough points!");
    }
  };

  const handleMobileMoney = () => {
    const amt = parseFloat(momoAmount);
    if (momoPhone && amt > 0) {
      setBalance(balance + amt);
      showToast(`Mobile Money payment processed: GHS ${amt.toFixed(2)}`);
      setShowMobileMoneyModal(false);
      setMomoPhone("");
      setMomoAmount("");
    } else {
      showToast("Enter phone and amount");
    }
  };

  const handleAddCard = () => {
    if (cardNumber.replace(/\s/g, "").length >= 12 && cardExpiry && cardCVV && cardName) {
      showToast("Card added successfully!");
      setShowCardModal(false);
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
      setCardName("");
    } else {
      showToast("Enter valid card details");
    }
  };

  const handleGenerateLink = () => {
    const amt = parseFloat(linkAmount);
    if (amt > 0) {
      const id = Math.random().toString(36).substring(2, 10);
      setGeneratedLink(`https://voxel.app/pay/${id}?amt=${amt}`);
      showToast("Payment link generated!");
    } else {
      showToast("Enter a valid amount");
    }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (amt > 0 && amt <= balance) {
      setBalance(balance - amt);
      showToast(`Withdrew GHS ${amt.toFixed(2)} via ${withdrawMethod}`);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
    } else if (amt > balance) {
      showToast("Insufficient balance!");
    } else {
      showToast("Enter a valid amount");
    }
  };

  const handlePayBill = () => {
    const amt = parseFloat(billAmount);
    if (selectedBill !== null && billAccount && amt > 0 && amt <= balance) {
      const bill = billTypes[selectedBill];
      setBalance(balance - amt);
      showToast(`${bill.label} bill paid: GHS ${amt.toFixed(2)}`);
      setShowBillsModal(false);
      setSelectedBill(null);
      setBillAccount("");
      setBillAmount("");
    } else if (amt > balance) {
      showToast("Insufficient balance!");
    } else {
      showToast("Fill all fields");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(`${label} copied!`);
  };

  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  const handleQuickAction = (label: string) => {
    switch (label) {
      case "Mobile Money":
        setShowMobileMoneyModal(true);
        break;
      case "Bank Transfer":
        setShowBankModal(true);
        break;
      case "Cards":
        setShowCardModal(true);
        break;
      case "Pay Bills":
        setShowBillsModal(true);
        break;
      default:
        showToast(`${label} - Coming soon!`);
    }
  };

  const handlePaymentMethod = (label: string) => {
    switch (label) {
      case "Mobile Money":
        setShowMobileMoneyModal(true);
        break;
      case "Bank Transfer":
        setShowBankModal(true);
        break;
      case "Debit/Credit Cards":
        setShowCardModal(true);
        break;
      case "Apple Pay":
        if (isIOS()) {
          setShowApplePayModal(true);
        } else {
          showToast("Apple Pay is only available on iOS Safari devices.");
        }
        break;
      case "Google Pay":
        setShowGooglePayModal(true);
        break;
      case "QR Pay":
        setShowQRModal(true);
        break;
      case "Payment Link":
        setShowPaymentLinkModal(true);
        break;
      case "Withdraw":
        setShowWithdrawModal(true);
        break;
      default:
        showToast(`${label} setup - Coming soon!`);
    }
  };

  const visibleTransactions = showAllTx ? allTransactions : allTransactions.slice(0, 5);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* ═══════ STICKY TOP BAR ═══════ */}
      <div
        className="sticky top-0 z-30 glass-strong backdrop-blur-xl"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-white">Wallet</h1>
          <button onClick={() => setShowRewardsModal(true)} className="glass rounded-xl p-2.5 touch-feedback card-hover">
            <Sparkles className="w-5 h-5 text-vox-orange" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 pb-16 lg:pb-0 space-y-8">

        {/* ═══════ BALANCE HERO CARD ═══════ */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative glass-strong rounded-3xl p-4 sm:p-6 overflow-hidden"
        >
          {/* gradient background overlay */}
          <div
            className="absolute inset-0 opacity-90 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(124,44,255,0.35) 0%, rgba(93,25,201,0.25) 40%, rgba(255,44,145,0.30) 100%)" }}
          />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.04]" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vox-muted uppercase tracking-wide flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Your Balance
              </span>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 touch-feedback"
              >
                {balanceVisible ? (
                  <Eye className="w-4 h-4 text-white/80" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/80" />
                )}
              </button>
            </div>

            <div>
              <AnimatePresence mode="wait">
                {balanceVisible ? (
                  <motion.h2
                    key="balance-show"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                  >
                    GHS {balance.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.h2>
                ) : (
                  <motion.h2
                    key="balance-hide"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                  >
                    ••••••
                  </motion.h2>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/60 text-sm">USD {(balance / 13.5).toFixed(2)}</span>
                <span className="flex items-center gap-1 text-emerald-300 text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  +2.4% this month
                </span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-1">
              <button
                onClick={() => setShowAddMoney(true)}
                className="btn-gradient rounded-2xl py-2.5 sm:py-3 text-sm font-semibold flex-1 touch-feedback flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Money
              </button>
              <button
                onClick={() => setShowSendMoney(true)}
                className="btn-gradient rounded-2xl py-2.5 sm:py-3 text-sm font-semibold flex-1 touch-feedback flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Money
              </button>
            </div>

            {/* ═══════ QUICK STATS GRID ═══════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="glass rounded-2xl p-3 sm:p-4 touch-feedback card-hover flex flex-col items-center gap-2"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-vox-muted font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════ VOX COINS ═══════ */}
        <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-vox-warning" />
            VOX Coins
          </h2>

          <div className="glass rounded-2xl p-4 sm:p-5 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", boxShadow: "0 0 24px rgba(255,215,0,0.35)" }}
                >
                  🪙
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-white">{coinBalance.toLocaleString()}</p>
                  <p className="text-sm text-vox-muted">VOX Coins</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUp(true)}
                className="btn-gradient rounded-2xl py-2.5 px-5 text-white text-sm font-semibold touch-feedback"
              >
                Top Up
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {giftTiers.map((tier, i) => (
              <motion.button
                key={tier.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleGift(tier)}
                className="glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1.5 touch-feedback card-hover"
              >
                <span className="text-2xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">{tier.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-white">{tier.name}</span>
                <span className="flex items-center gap-1 text-[10px] text-vox-muted font-medium">
                  <Coins className="w-3 h-3" />
                  {tier.cost.toLocaleString()}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ═══════ PAYMENT METHODS ═══════ */}
        <motion.section custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-vox-purple" />
            Payment Methods
          </h2>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {paymentMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.label}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => handlePaymentMethod(method.label)}
                  className="glass rounded-2xl p-3 sm:p-4 touch-feedback card-hover flex items-center gap-2 sm:gap-3 text-left"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${method.color}18` }}>
                    <span style={{ color: method.color }}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">{method.label}</p>
                    <p className="text-[10px] sm:text-xs text-vox-muted mt-0.5 truncate">{method.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.section>

        {/* ═══════ RECENT TRANSACTIONS ═══════ */}
        <motion.section custom={3} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-vox-cyan" />
              Recent Activity
            </h2>
            <button
              onClick={() => setShowAllTx(!showAllTx)}
              className="text-sm text-vox-purple font-medium flex items-center gap-1 touch-feedback rounded-lg px-2 py-1"
            >
              {showAllTx ? "Show Less" : "View All"} <ChevronRight className={`w-4 h-4 transition-transform ${showAllTx ? "rotate-90" : ""}`} />
            </button>
          </div>

          <div className="space-y-2">
            {visibleTransactions.map((tx, i) => {
              const TxIcon = tx.icon;
              const amountColor = tx.type === "credit" ? "text-vox-green" : tx.type === "coins" ? "text-vox-warning" : "text-vox-pink";
              const iconBg = tx.type === "credit" ? "bg-vox-green/10 text-vox-green" : tx.type === "coins" ? "bg-vox-warning/10 text-vox-warning" : "bg-vox-pink/10 text-vox-pink";

              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setExpandedTx(expandedTx === i ? null : i)}
                  className="touch-feedback card-hover rounded-2xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 p-3 sm:p-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <TxIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.label}</p>
                      <p className="text-[10px] sm:text-xs text-vox-muted mt-0.5">{tx.time}</p>
                    </div>
                    <span className={`text-sm sm:text-base font-bold whitespace-nowrap ${amountColor}`}>{tx.amount}</span>
                    <ChevronRight className={`w-4 h-4 text-vox-muted transition-transform ${expandedTx === i ? "rotate-90" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {expandedTx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-5 pb-4 pl-13 sm:pl-16 grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-vox-muted">Status:</span> <span className="text-vox-green font-medium">{tx.status}</span></div>
                          <div><span className="text-vox-muted">Category:</span> <span className="text-white font-medium">{tx.category}</span></div>
                          <div><span className="text-vox-muted">Date:</span> <span className="text-white font-medium">{tx.time}</span></div>
                          <div><span className="text-vox-muted">Ref:</span> <span className="text-white font-medium">VX{1000 + i}TX</span></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════ SECURITY SECTION ═══════ */}
        <motion.section custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <div className="glass rounded-2xl gradient-border overflow-hidden">
            <div className="relative z-10 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-vox-green/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-vox-green" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bank-grade Security</h3>
                  <p className="text-xs text-vox-muted">Your money is always protected</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {securityFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-vox-muted">
                    <Check className="w-4 h-4 text-vox-green flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ═══════ ADD MONEY MODAL ═══════ */}
      <AnimatePresence>
        {showAddMoney && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMoney(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Money</h3>
                <button onClick={() => setShowAddMoney(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["50", "100", "200", "500"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAddAmount(amt)}
                    className="py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm text-white font-medium transition-colors touch-feedback"
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMoney}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Confirm Add Money
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ SEND MONEY MODAL ═══════ */}
      <AnimatePresence>
        {showSendMoney && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSendMoney(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Send Money</h3>
                <button onClick={() => setShowSendMoney(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Recipient (username or phone)</label>
                <input
                  type="text"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder="@username or +233..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handleSendMoney}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Send Money
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TOP UP COINS MODAL ═══════ */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTopUp(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Top Up VOX Coins</h3>
                <button onClick={() => setShowTopUp(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                {coinPackages.map((pkg, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCoinPkg(i)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all touch-feedback ${
                      selectedCoinPkg === i ? "bg-vox-purple/20 border border-vox-purple" : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🪙</span>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{pkg.coins.toLocaleString()} Coins</p>
                        {pkg.bonus && <p className="text-[11px] text-vox-green">{pkg.bonus}</p>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white">{pkg.price}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleTopUp}
                disabled={selectedCoinPkg === null}
                className={`w-full py-3 rounded-xl text-white font-semibold transition-all touch-feedback ${
                  selectedCoinPkg !== null ? "btn-gradient" : "bg-white/[0.06] text-vox-muted cursor-not-allowed"
                }`}
              >
                Purchase Coins
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ REWARDS MODAL ═══════ */}
      <AnimatePresence>
        {showRewardsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRewardsModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-vox-orange" />
                  VOXel Rewards
                </h3>
                <button onClick={() => setShowRewardsModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>

              <div className="glass rounded-2xl p-4 text-center">
                <p className="text-xs text-vox-muted uppercase tracking-wide">Your Points</p>
                <p className="text-3xl font-extrabold text-vox-orange mt-1">{rewardPoints.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Available Rewards</p>
                <div className="space-y-2">
                  {rewardTiers.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.06] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🪙</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{tier.label}</p>
                          <p className="text-[11px] text-vox-muted">{tier.points.toLocaleString()} points</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(tier)}
                        disabled={rewardPoints < tier.points}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold touch-feedback ${
                          rewardPoints >= tier.points ? "btn-gradient text-white" : "bg-white/[0.06] text-vox-muted cursor-not-allowed"
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Earn Points</p>
                <div className="grid grid-cols-2 gap-2">
                  {earnMethods.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                      <span className="text-lg">{m.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{m.label}</p>
                        <p className="text-[10px] text-vox-green">{m.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ MOBILE MONEY MODAL ═══════ */}
      <AnimatePresence>
        {showMobileMoneyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMoneyModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-vox-orange" />
                  Mobile Money
                </h3>
                <button onClick={() => setShowMobileMoneyModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={momoAmount}
                  onChange={(e) => setMomoAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handleMobileMoney}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Send
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BANK TRANSFER MODAL ═══════ */}
      <AnimatePresence>
        {showBankModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBankModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-vox-cyan" />
                  Bank Transfer
                </h3>
                <button onClick={() => setShowBankModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-vox-muted">Transfer to the account below to fund your wallet.</p>
              {[
                { label: "Account Name", value: "VOXel Inc" },
                { label: "Account Number", value: "0123456789" },
                { label: "Bank", value: "GTBank Ghana" },
                { label: "Sort Code", value: "058152" },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.06] border border-white/10">
                  <div>
                    <p className="text-[11px] text-vox-muted">{field.label}</p>
                    <p className="text-sm font-semibold text-white">{field.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(field.value, field.label)}
                    className="glass rounded-lg p-2 touch-feedback card-hover"
                  >
                    <Copy className="w-4 h-4 text-vox-muted" />
                  </button>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ CARD MODAL ═══════ */}
      <AnimatePresence>
        {showCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCardModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-vox-purple" />
                  Add Card
                </h3>
                <button onClick={() => setShowCardModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-vox-muted mb-1.5 block">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                  />
                </div>
                <div>
                  <label className="text-xs text-vox-muted mb-1.5 block">CVV</label>
                  <input
                    type="text"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    placeholder="123"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handleAddCard}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Add Card
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ APPLE PAY MODAL ═══════ */}
      <AnimatePresence>
        {showApplePayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApplePayModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 text-center"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Apple Pay</h3>
                <button onClick={() => setShowApplePayModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-vox-muted">Confirm payment with Apple Pay.</p>
              <button
                onClick={() => {
                  showToast("Apple Pay payment confirmed!");
                  setShowApplePayModal(false);
                }}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Confirm with Apple Pay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ GOOGLE PAY MODAL ═══════ */}
      <AnimatePresence>
        {showGooglePayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGooglePayModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 text-center"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Google Pay</h3>
                <button onClick={() => setShowGooglePayModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-vox-muted">Pay with Google Pay</p>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={gpayAmount}
                  onChange={(e) => setGpayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={() => {
                  const amt = parseFloat(gpayAmount);
                  if (amt > 0) {
                    showToast(`Google Pay payment of GHS ${amt.toFixed(2)} confirmed!`);
                    setShowGooglePayModal(false);
                    setGpayAmount("");
                  } else {
                    showToast("Enter a valid amount");
                  }
                }}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Confirm Payment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ QR PAY MODAL ═══════ */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQRModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 text-center"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-vox-cyan" />
                  QR Pay
                </h3>
                <button onClick={() => setShowQRModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="relative mx-auto w-48 h-48 rounded-2xl bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center overflow-hidden gap-2">
                <span className="text-6xl">📷</span>
                <span className="text-vox-muted text-sm font-semibold">Scan QR Code</span>
                <motion.div
                  initial={{ y: -48 }}
                  animate={{ y: 48 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-vox-cyan to-transparent"
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs text-vox-muted">Scan the code with your camera to pay</p>
                <p className="text-xs text-white font-medium">VOXel Inc · @voxelapp</p>
              </div>
              <button
                onClick={() => {
                  const link = "https://pay.voxel.app/qr/voxelapp";
                  if (navigator.clipboard) navigator.clipboard.writeText(link);
                  showToast("Payment link copied!");
                }}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Share QR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PAYMENT LINK MODAL ═══════ */}
      <AnimatePresence>
        {showPaymentLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentLinkModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-vox-pink" />
                  Payment Link
                </h3>
                <button onClick={() => setShowPaymentLinkModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={linkAmount}
                  onChange={(e) => setLinkAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Note (optional)</label>
                <input
                  type="text"
                  value={linkNote}
                  onChange={(e) => setLinkNote(e.target.value)}
                  placeholder="What's it for?"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handleGenerateLink}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Generate Link
              </button>
              {generatedLink && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.06] border border-white/10">
                  <p className="text-xs text-white truncate flex-1">{generatedLink}</p>
                  <button
                    onClick={() => copyToClipboard(generatedLink, "Link")}
                    className="glass rounded-lg p-2 touch-feedback card-hover ml-2"
                  >
                    <Copy className="w-4 h-4 text-vox-muted" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ WITHDRAW MODAL ═══════ */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWithdrawModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-vox-green" />
                  Withdraw
                </h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Mobile Money", "Bank Account"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setWithdrawMethod(m)}
                      className={`py-2.5 rounded-lg text-sm font-medium touch-feedback ${
                        withdrawMethod === m ? "bg-vox-purple/20 border border-vox-purple text-white" : "bg-white/[0.06] border border-white/10 text-vox-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Withdraw
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BILLS MODAL ═══════ */}
      <AnimatePresence>
        {showBillsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBillsModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-vox-green" />
                  Pay Bills
                </h3>
                <button onClick={() => setShowBillsModal(false)} className="text-vox-muted hover:text-white touch-feedback rounded-lg p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {billTypes.map((bill, i) => {
                  const BillIcon = bill.icon;
                  return (
                    <button
                      key={bill.label}
                      onClick={() => setSelectedBill(i)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl touch-feedback ${
                        selectedBill === i ? "bg-vox-purple/20 border border-vox-purple" : "bg-white/[0.06] border border-white/10"
                      }`}
                    >
                      <BillIcon className="w-5 h-5" style={{ color: bill.color }} />
                      <span className="text-[10px] text-vox-muted">{bill.label}</span>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Account Number</label>
                <input
                  type="text"
                  value={billAccount}
                  onChange={(e) => setBillAccount(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-vox-purple"
                />
              </div>
              <div>
                <label className="text-xs text-vox-muted mb-1.5 block">Amount (GHS)</label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-vox-purple"
                />
              </div>
              <button
                onClick={handlePayBill}
                className="w-full py-3 rounded-xl text-white font-semibold btn-gradient touch-feedback"
              >
                Pay Bill
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 z-[60] glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
