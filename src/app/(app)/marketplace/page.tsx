"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import UserAds from "./UserAds";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  Star,
  Zap,
  Shield,
  ChevronRight,
  Clock,
  BadgeCheck,
  Flame,
  ArrowRight,
  X,
  Plus,
} from "lucide-react";

/* ── Data ── */
const categories = [
  "All",
  "Straight",
  "Curly",
  "Wavy",
  "Custom",
];

const auctions = [
  {
    id: 1,
    name: "Ombre Color Masterpiece",
    bid: 8300,
    bidders: 45,
    emoji: "💇‍♀️",
    gradient: "from-vox-purple/40 to-vox-pink/40",
    image: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=400&h=300&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Ocean Wave Goddess",
    bid: 8500,
    bidders: 23,
    emoji: "�‍♀️",
    gradient: "from-vox-pink/40 to-vox-orange/40",
    image: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=300&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Silk Press Straight",
    bid: 4200,
    bidders: 67,
    emoji: "💇‍♀️",
    gradient: "from-vox-cyan/40 to-vox-purple/40",
    image: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=300&auto=format&fit=crop",
  },
];

const products = [
  { id: 1, name: "Brown Highlight Egg Roll Curls", price: 1850, rating: 4.8, reviews: 324, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-orange/30 to-vox-pink/30", saved: false, image: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 2000 as number | undefined, badge: undefined as string | undefined },
  { id: 2, name: "Curly Goddess Curls", price: 2500, rating: 4.9, reviews: 189, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-purple/30 to-vox-cyan/30", saved: true, image: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 2800 as number | undefined, badge: "Premium" as string | undefined },
  { id: 3, name: "Luxury Straight Bob", price: 2600, rating: 4.7, reviews: 512, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-pink/30 to-vox-purple/30", saved: false, image: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 3000 as number | undefined, badge: "Best Seller" as string | undefined },
  { id: 4, name: "Body Wave Elegance", price: 2500, rating: 4.8, reviews: 276, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-orange/30 to-vox-warning/30", saved: false, image: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Wavy", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 2800 as number | undefined, badge: "Sale" as string | undefined },
  { id: 5, name: "Deep Wave Luxury", price: 1250, rating: 4.6, reviews: 143, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-cyan/30 to-vox-green/30", saved: false, image: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Wavy", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Exclusive" as string | undefined },
  { id: 6, name: "SNY Custom Blonde Bob", price: 2800, rating: 4.7, reviews: 398, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-green/30 to-vox-cyan/30", saved: true, image: "https://images.unsplash.com/photo-1763551229518-4a529c865e00?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Custom", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 3300 as number | undefined, badge: "Custom" as string | undefined },
  { id: 7, name: "Silk Press Straight", price: 4200, rating: 4.5, reviews: 87, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-pink/30 to-vox-orange/30", saved: false, image: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 5000 as number | undefined, badge: "Popular" as string | undefined },
  { id: 8, name: "Nova Pixie Curls", price: 2300, rating: 4.8, reviews: 231, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-purple/30 to-vox-pink/30", saved: false, image: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 2500 as number | undefined, badge: "Trending" as string | undefined },
  { id: 9, name: "Ombre Color Masterpiece", price: 8300, rating: 4.9, reviews: 156, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-purple/30 to-vox-orange/30", saved: false, image: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Custom", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 9000 as number | undefined, badge: "Artistic" as string | undefined },
  { id: 10, name: "Kinky Curly Afro", price: 890, rating: 4.7, reviews: 412, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-green/30 to-vox-orange/30", saved: false, image: "https://images.unsplash.com/photo-1613730318129-bf0ca2a12364?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Natural" as string | undefined },
  { id: 11, name: "Lace Frontal Unit", price: 1500, rating: 4.8, reviews: 287, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-cyan/30 to-vox-purple/30", saved: true, image: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Custom", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Premium" as string | undefined },
  { id: 12, name: "Classic Long Layers", price: 980, rating: 4.6, reviews: 198, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-pink/30 to-vox-cyan/30", saved: false, image: "https://plus.unsplash.com/premium_photo-1742909963702-656d8e16146a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Elegant" as string | undefined },
  { id: 13, name: "Curly Pixie Lace Frontal Unit", price: 450, rating: 4.5, reviews: 76, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-orange/30 to-vox-pink/30", saved: false, image: "https://images.unsplash.com/photo-1758600435913-c45b319745ca?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 600 as number | undefined, badge: "Premium" as string | undefined },
  { id: 14, name: "Ocean Wave Goddess", price: 8500, rating: 5.0, reviews: 89, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-cyan/30 to-vox-blue-400/30", saved: false, image: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Wavy", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 9400 as number | undefined, badge: "Trending" as string | undefined },
  { id: 15, name: "Custom Blonde Bombshell", price: 1800, rating: 4.7, reviews: 145, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-warning/30 to-vox-orange/30", saved: false, image: "https://plus.unsplash.com/premium_photo-1661326264567-360a3576a470?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Custom", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: undefined as string | undefined },
  { id: 16, name: "Water Wave Goddess", price: 1050, rating: 4.6, reviews: 234, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-cyan/30 to-vox-green/30", saved: false, image: "https://images.unsplash.com/photo-1765828592941-3b76fc06360a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Wavy", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 1300 as number | undefined, badge: "Trending" as string | undefined },
  { id: 17, name: "Luxury Straight Wig", price: 850, rating: 4.5, reviews: 167, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-purple/30 to-vox-pink/30", saved: false, image: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Best Seller" as string | undefined },
  { id: 18, name: "Kinky Straight Blend", price: 750, rating: 4.4, reviews: 92, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-orange/30 to-vox-warning/30", saved: false, image: "https://plus.unsplash.com/premium_photo-1742909963702-656d8e16146a?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: undefined as string | undefined },
  { id: 19, name: "Custom Colored Unit", price: 2000, rating: 4.8, reviews: 112, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-pink/30 to-vox-purple/30", saved: false, image: "https://images.unsplash.com/photo-1763551229518-4a529c865e00?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Custom", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: undefined as string | undefined },
  { id: 20, name: "613 Blonde Straight", price: 1500, rating: 4.7, reviews: 203, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-warning/30 to-vox-pink/30", saved: true, image: "https://plus.unsplash.com/premium_photo-1661326264567-360a3576a470?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Premium" as string | undefined },
  { id: 21, name: "Loose Wave Classic", price: 980, rating: 4.6, reviews: 178, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-cyan/30 to-vox-purple/30", saved: false, image: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Wavy", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: undefined as string | undefined },
  { id: 22, name: "Sleek Bob Cut", price: 650, rating: 4.5, reviews: 256, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-purple/30 to-vox-cyan/30", saved: false, image: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Straight", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: "Popular" as string | undefined },
  { id: 23, name: "Natural Kinky Wig", price: 890, rating: 4.7, reviews: 145, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-green/30 to-vox-cyan/30", saved: false, image: "https://images.unsplash.com/photo-1613730318129-bf0ca2a12364?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: undefined as number | undefined, badge: undefined as string | undefined },
  { id: 24, name: "Curly Premium Wig", price: 950, rating: 4.8, reviews: 198, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", gradient: "from-vox-pink/30 to-vox-orange/30", saved: false, image: "https://images.unsplash.com/photo-1758600435913-c45b319745ca?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", category: "Curly", seller: "JUST WEAR WIGS", sellerAvatar: "/profiles/justwearwigs/avatar.jpeg", originalPrice: 1100 as number | undefined, badge: "Sale" as string | undefined },
];

const sellers = [
  { id: 1, name: "JUST WEAR WIGS", rating: 4.9, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", products: 46, avatar: "/profiles/justwearwigs/avatar.jpeg" },
  { id: 2, name: "Glow By Nana", rating: 4.8, emoji: "\u2728", products: 28, avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 3, name: "Berry Beauty", rating: 4.7, emoji: "\u{1F484}", products: 35, avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
  { id: 4, name: "Hair By Maame", rating: 4.9, emoji: "\u{1F487}\u{200D}\u{2640}\u{FE0F}", products: 52, avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces" },
];

/* ── Countdown Hook ── */
function useCountdown() {
  const [time, setTime] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) return { hours: 12, minutes: 45, seconds: 30 };
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
}

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ══════════════════════════════════════════════════
   MARKETPLACE PAGE
   ══════════════════════════════════════════════════ */
export default function MarketplacePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItems, setSavedItems] = useState<Record<number, boolean>>(
    Object.fromEntries(products.map((p) => [p.id, p.saved]))
  );
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  const [biddingOn, setBiddingOn] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidPlaced, setBidPlaced] = useState<Record<number, boolean>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const countdown = useCountdown();
  const productsRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleSave = (id: number) => {
    setSavedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      showToast(next[id] ? "Saved to wishlist ♥" : "Removed from wishlist");
      return next;
    });
  };

  /* Filter products by search query and category */
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  /* Add to cart */
  const handleAddToCart = (product: (typeof products)[number]) => {
    setCart((prev) => {
      const next = new Set(prev);
      const key = `${product.id}`;
      if (!next.has(key)) {
        next.add(key);
        setCartCount((c) => c + 1);
      }
      return next;
    });
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  /* Place bid */
  const handlePlaceBid = (auction: (typeof auctions)[number]) => {
    setBiddingOn(auction.id);
    setBidAmount(String(auction.bid + 50));
  };

  const submitBid = (auction: (typeof auctions)[number]) => {
    const amount = Number(bidAmount);
    if (!amount || amount <= auction.bid) {
      alert(`Bid must be higher than current bid of GHS ${auction.bid.toLocaleString()}`);
      return;
    }
    setBidPlaced((prev) => ({ ...prev, [auction.id]: true }));
    setBiddingOn(null);
    setBidAmount("");
    setTimeout(() => {
      setBidPlaced((prev) => ({ ...prev, [auction.id]: false }));
    }, 2500);
  };

  /* Buy now → checkout */
  const handleBuyNow = () => {
    showToast(`Order placed! Check your wallet.`);
    setTimeout(() => router.push("/wallet"), 1500);
  };

  /* Shop now → scroll to products */
  const handleShopNow = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Seller card click → profile */
  const handleSellerClick = () => {
    router.push("/profile");
  };

  const cartItems = Array.from(cart)
    .map((key) => products.find((p) => String(p.id) === key))
    .filter(Boolean) as (typeof products)[number][];

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-8 space-y-6" style={{ paddingBottom: "calc(6rem + var(--safe-bottom, 0px))" }}>
        {/* ═══════ HEADER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Our Collection</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/create")}
              className="btn-gradient rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white touch-feedback flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Post Ad
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setCartOpen((o) => !o)}
              className="relative w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-vox-muted" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-vox-pink to-vox-purple text-[10px] font-bold text-white flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
            {cartOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 glass rounded-2xl p-3 shadow-xl shadow-black/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Cart ({cartCount})</span>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-vox-muted hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>
                {cartItems.length === 0 ? (
                  <p className="text-xs text-vox-muted py-4 text-center">Your cart is empty</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{item.name}</p>
                          <p className="text-[11px] text-vox-muted">
                            GHS {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleBuyNow}
                      className="w-full mt-2 py-2 rounded-lg btn-gradient text-xs font-bold text-white"
                    >
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════ SEARCH BAR ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, stores..."
              className="w-full h-11 pl-10 pr-4 rounded-xl glass text-sm text-white placeholder:text-vox-muted focus:outline-none focus:ring-1 focus:ring-vox-purple/50 transition-all"
            />
          </div>
        </motion.div>

        {/* ═══════ CATEGORY FILTER ═══════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "btn-gradient text-white shadow-lg shadow-vox-pink/20"
                  : "glass text-vox-muted hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ═══════ FLASH DEALS BANNER ═══════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vox-purple via-vox-pink to-vox-orange opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative flex items-center justify-between p-5 sm:p-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Premium Luxury Wigs — Crafted with Excellence
                </h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleShopNow}
                  className="px-4 py-1.5 rounded-lg bg-white text-vox-purple text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-1.5"
                >
                  Shop Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends in</span>
                  <span className="font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded-md text-sm">
                    {countdown}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex text-5xl ml-4 animate-float">🛍️</div>
          </div>
        </motion.div>

        {/* ═══════ LIVE AUCTIONS ═══════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white">Live Auctions</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-vox-danger/20 text-vox-danger text-[10px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-vox-danger animate-pulse" />
                Live
              </span>
            </div>
            <button onClick={() => router.push("/explore")} className="flex items-center gap-1 text-xs text-vox-muted hover:text-white transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {auctions.map((auction, i) => (
              <motion.div
                key={auction.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex-shrink-0 w-[220px] sm:w-[240px] glass rounded-2xl overflow-hidden card-hover"
              >
                {/* Product image */}
                <div className="relative h-32 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auction.image}
                    alt={auction.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 text-2xl drop-shadow-lg">
                    {auction.emoji}
                  </span>
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-vox-danger/90 backdrop-blur-sm text-[10px] font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                </div>
                {/* Info */}
                <div className="p-3.5 space-y-2.5">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {auction.name}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-[11px] text-vox-muted">Current Bid</p>
                    <p className="text-base font-bold text-gradient">
                      GHS {auction.bid.toLocaleString()}
                    </p>
                  </div>
                  {biddingOn === auction.id ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg glass text-xs text-white focus:outline-none focus:ring-1 focus:ring-vox-purple/50"
                        placeholder="Your bid"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitBid(auction)}
                          className="flex-1 py-1.5 rounded-lg btn-gradient text-[11px] font-bold text-white"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => {
                            setBiddingOn(null);
                            setBidAmount("");
                          }}
                          className="flex-1 py-1.5 rounded-lg glass text-[11px] font-bold text-vox-muted hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : bidPlaced[auction.id] ? (
                    <div className="text-center py-1.5 rounded-lg bg-vox-green/20 text-vox-green text-[11px] font-bold">
                      Bid Placed! ✓
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-vox-muted">
                        {auction.bidders} bidders
                      </span>
                      <button
                        onClick={() => handlePlaceBid(auction)}
                        className="px-3 py-1.5 rounded-lg btn-gradient text-[11px] font-bold text-white"
                      >
                        Place Bid
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ USER POSTED ADS ═══════ */}
        <UserAds />

        {/* ═══════ PRODUCTS GRID ═══════ */}
        <motion.section
          ref={productsRef}
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-3 scroll-mt-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-vox-orange" />
              <h2 className="text-base sm:text-lg font-bold text-white">Premium Luxury Wigs</h2>
            </div>
            <button onClick={() => router.push("/explore")} className="flex items-center gap-1 text-xs text-vox-muted hover:text-white transition-colors">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-sm text-vox-muted">
                No products found{searchQuery ? ` for &quot;${searchQuery}&quot;` : ""}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  custom={i}
                  variants={fadeUp}
                  onClick={() => { setSelectedProduct(product); setQuantity(1); }}
                  className="glass rounded-2xl overflow-hidden card-hover group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Emoji badge */}
                    <span className="absolute bottom-2 right-2.5 text-xl drop-shadow-lg">
                      {product.emoji}
                    </span>
                    {/* Heart */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(product.id); }}
                      className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/50"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          savedItems[product.id]
                            ? "text-vox-pink fill-vox-pink"
                            : "text-white/70"
                        }`}
                      />
                    </button>
                    {/* Verified badge */}
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/30 backdrop-blur-sm">
                      <BadgeCheck className="w-3 h-3 text-vox-cyan" />
                      <span className="text-[9px] font-medium text-white/80">Verified</span>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {product.name}
                    </h3>
                    <p className="text-base font-bold text-gradient">
                      GHS {product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-vox-warning fill-vox-warning" />
                      <span className="text-xs text-white font-medium">
                        {product.rating}
                      </span>
                      <span className="text-[11px] text-vox-muted">
                        ({product.reviews})
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className={`w-full py-2 rounded-xl text-xs font-bold text-white mt-1 transition-all ${
                        addedItems[product.id]
                          ? "bg-vox-green"
                          : "btn-gradient"
                      }`}
                    >
                      {addedItems[product.id] ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ═══════ LIVE SHOPPING (BUY NOW) ═══════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-vox-pink/30 to-vox-purple/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-vox-pink" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Shopping Now On</h3>
              <p className="text-xs text-vox-muted">Tap to buy featured items instantly</p>
            </div>
          </div>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2 rounded-xl btn-gradient text-xs font-bold text-white whitespace-nowrap"
          >
            Buy Now
          </button>
        </motion.section>

        {/* ═══════ VERIFIED SELLERS ═══════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-vox-cyan" />
              <h2 className="text-base sm:text-lg font-bold text-white">Trusted Sellers</h2>
            </div>
            <button onClick={() => router.push("/explore")} className="flex items-center gap-1 text-xs text-vox-muted hover:text-white transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {sellers.map((seller, i) => (
              <motion.div
                key={seller.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                onClick={handleSellerClick}
                className="flex-shrink-0 w-[160px] sm:w-[180px] glass rounded-2xl p-4 text-center card-hover cursor-pointer"
              >
                <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-vox-purple/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-white truncate">
                  {seller.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-vox-warning fill-vox-warning" />
                  <span className="text-xs text-white font-medium">{seller.rating}</span>
                  <span className="text-[10px] text-vox-muted">• {seller.products} items</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSellerClick();
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg glass text-[11px] font-semibold text-vox-muted hover:text-white transition-colors"
                >
                  Visit Shop
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════ ESCROW BANNER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="glass rounded-2xl gradient-border overflow-hidden"
        >
          <div className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vox-green/20 to-vox-cyan/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-vox-green" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Protected by VOX Escrow
                <BadgeCheck className="w-4 h-4 text-vox-green" />
              </h3>
              <p className="text-xs text-vox-muted mt-0.5 leading-relaxed">
                Every transaction is secured with escrow protection. Your funds are only released when you confirm delivery.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════ TOAST NOTIFICATION ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] px-4 py-2.5 glass-strong rounded-full text-sm font-semibold text-white shadow-xl shadow-black/30 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PRODUCT DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 glass-strong flex items-center justify-between px-4 py-3 rounded-t-3xl sm:rounded-t-3xl z-10">
                <h3 className="text-base font-bold text-white">Product Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              {/* Image */}
              <div className="aspect-square w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xl font-extrabold text-vox-pink">
                      GHS {selectedProduct.price.toLocaleString()}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-vox-muted line-through">
                        GHS {selectedProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {selectedProduct.badge && (
                      <span className="text-[10px] font-bold bg-vox-orange/20 text-vox-orange px-2 py-0.5 rounded-full">
                        {selectedProduct.badge}
                      </span>
                    )}
                  </div>
                </div>
                {/* Seller */}
                <div className="flex items-center gap-3 glass rounded-2xl p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProduct.sellerAvatar}
                    alt={selectedProduct.seller}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{selectedProduct.seller}</p>
                    <p className="text-xs text-vox-muted">Verified Seller</p>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="text-xs font-semibold text-vox-purple"
                  >
                    View Shop
                  </button>
                </div>
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
                  <p className="text-sm text-vox-muted leading-relaxed">
                    Premium quality product from a trusted VOXel creator. Authenticity guaranteed with VOXel Buyer Protection. Ships within 2–5 business days. Free returns within 30 days.
                  </p>
                </div>
                {/* Reviews */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Reviews ({selectedProduct.reviews})</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Ama B.", avatar: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces", rating: 5, text: "Amazing quality! Exactly as shown in the video. Fast delivery too.", time: "2 days ago" },
                      { name: "Esi O.", avatar: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces", rating: 4, text: "Great product, love it. The packaging was also very nice.", time: "1 week ago" },
                      { name: "Adwoa M.", avatar: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop&crop=faces", rating: 5, text: "Exceeded my expectations. Will definitely order again!", time: "2 weeks ago" },
                    ].map((r, i) => (
                      <div key={i} className="glass rounded-2xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{r.name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, si) => (
                                <span key={si} className="text-vox-orange text-[10px]">★</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-vox-muted">{r.time}</span>
                        </div>
                        <p className="text-xs text-vox-muted">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Qty + Buttons */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-vox-muted">Qty:</span>
                  <div className="flex items-center glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-white"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                      showToast(`Added to cart!`);
                    }}
                    className="glass rounded-2xl py-3 text-sm font-semibold text-white"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      handleBuyNow();
                    }}
                    className="btn-gradient rounded-2xl py-3 text-sm font-semibold text-white"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
