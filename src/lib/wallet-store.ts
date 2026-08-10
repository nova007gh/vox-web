"use client";

/* ─────────────────────────────────────────────────────────────
   WALLET STORE — VOX Coins, fiat balance, transactions, earnings
   Hybrid: Firestore when configured, localStorage fallback.
   Designed so the Flutter app can consume the same collections.
   ───────────────────────────────────────────────────────────── */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export { isFirebaseConfigured };

const USE_FIREBASE = isFirebaseConfigured();

/* ─────────────── TYPES ─────────────── */

export interface Transaction {
  id: string;
  username: string;
  label: string;
  amount: number;
  type: "credit" | "debit" | "coins";
  time: string;
  status: "Completed" | "Pending" | "Failed";
  category: "Transfer" | "Airtime" | "Shopping" | "Coins" | "Gift" | "Auction" | "Earnings" | "Withdraw" | "TopUp";
}

export interface Earning {
  id: string;
  username: string;
  source: "gift" | "subscription" | "shop" | "auction" | "ad";
  amount: number;
  createdAt: number;
}

export interface Wallet {
  username: string;
  fiatBalance: number;
  coinBalance: number;
  rewardPoints: number;
  lifetimeEarnings: number;
  lifetimeGiftsReceived: number;
  pendingPayout: number;
  updatedAt: number;
}

export interface CoinPackage {
  coins: number;
  price: number;
  bonus: number;
}

export interface GiftTier {
  emoji: string;
  name: string;
  cost: number;
}

/* ─────────────── UI CONSTANTS ─────────────── */

export const coinPackages: CoinPackage[] = [
  { coins: 50, price: 2.0, bonus: 0 },
  { coins: 100, price: 4.0, bonus: 5 },
  { coins: 200, price: 8.0, bonus: 15 },
  { coins: 500, price: 20.0, bonus: 50 },
  { coins: 1000, price: 40.0, bonus: 120 },
  { coins: 5000, price: 200.0, bonus: 800 },
];

export const giftTiers: GiftTier[] = [
  { emoji: "❤️", name: "Heart", cost: 50 },
  { emoji: "🌹", name: "Rose", cost: 100 },
  { emoji: "🔥", name: "Fire", cost: 200 },
  { emoji: "💎", name: "Diamond", cost: 500 },
  { emoji: "🚀", name: "Rocket", cost: 1000 },
  { emoji: "👑", name: "King", cost: 5000 },
];

/* ─────────────── LOCAL STORAGE HELPERS ─────────────── */

const WALLET_KEY = (username: string) => `voxel_wallet_${username}`;
const TRANSACTIONS_KEY = (username: string) => `voxel_transactions_${username}`;
const EARNINGS_KEY = (username: string) => `voxel_earnings_${username}`;

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function generateId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateEarningId(): string {
  return `earn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ─────────────── WALLET CRUD ─────────────── */

export async function getWallet(username: string): Promise<Wallet> {
  const defaultWallet: Wallet = {
    username,
    fiatBalance: 0,
    coinBalance: 0,
    rewardPoints: 0,
    lifetimeEarnings: 0,
    lifetimeGiftsReceived: 0,
    pendingPayout: 0,
    updatedAt: Date.now(),
  };

  if (USE_FIREBASE && db) {
    try {
      const snap = await getDoc(doc(db, "wallets", username));
      if (snap.exists()) {
        const data = snap.data();
        return { ...defaultWallet, ...data, username } as Wallet;
      }
      await writeWallet(defaultWallet);
      return defaultWallet;
    } catch (err) {
      console.warn("Firebase wallet read failed, falling back to localStorage:", err);
    }
  }

  const local = readJSON<Wallet>(WALLET_KEY(username));
  return local || defaultWallet;
}

export async function writeWallet(wallet: Wallet): Promise<void> {
  wallet.updatedAt = Date.now();
  if (USE_FIREBASE && db) {
    try {
      await setDoc(doc(db, "wallets", wallet.username), { ...wallet }, { merge: true });
      return;
    } catch (err) {
      console.warn("Firebase wallet write failed, falling back to localStorage:", err);
    }
  }
  writeJSON(WALLET_KEY(wallet.username), wallet);
}

export async function ensureWallet(username: string): Promise<Wallet> {
  return getWallet(username);
}

export function subscribeToWallet(
  username: string,
  callback: (wallet: Wallet) => void,
): Unsubscribe | (() => void) {
  const defaultWallet: Wallet = {
    username,
    fiatBalance: 0,
    coinBalance: 0,
    rewardPoints: 0,
    lifetimeEarnings: 0,
    lifetimeGiftsReceived: 0,
    pendingPayout: 0,
    updatedAt: Date.now(),
  };

  if (USE_FIREBASE && db) {
    return onSnapshot(
      doc(db, "wallets", username),
      (snap) => {
        callback(snap.exists() ? ({ ...defaultWallet, ...snap.data(), username } as Wallet) : defaultWallet);
      },
      () => callback(defaultWallet),
    );
  }

  const handler = () => {
    const local = readJSON<Wallet>(WALLET_KEY(username));
    callback(local || defaultWallet);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
    handler();
  }

  return () => {
    if (typeof window !== "undefined") window.removeEventListener("storage", handler);
  };
}

/* ─────────────── TRANSACTIONS ─────────────── */

export async function getTransactions(username: string): Promise<Transaction[]> {
  if (USE_FIREBASE && db) {
    try {
      const q = query(collection(db, "transactions"), where("username", "==", username));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as unknown as Transaction))
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    } catch (err) {
      console.warn("Firebase transactions read failed, falling back to localStorage:", err);
    }
  }

  const local = readJSON<Transaction[]>(TRANSACTIONS_KEY(username)) || [];
  return local.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export async function addTransaction(username: string, tx: Omit<Transaction, "id">): Promise<Transaction> {
  const fullTx: Transaction = { ...tx, id: generateId() };

  if (USE_FIREBASE && db) {
    try {
      await addDoc(collection(db, "transactions"), {
        ...fullTx,
        createdAt: serverTimestamp(),
      });
      return fullTx;
    } catch (err) {
      console.warn("Firebase transaction write failed, falling back to localStorage:", err);
    }
  }

  const existing = readJSON<Transaction[]>(TRANSACTIONS_KEY(username)) || [];
  const updated = [fullTx, ...existing];
  writeJSON(TRANSACTIONS_KEY(username), updated);
  return fullTx;
}

/* ─────────────── EARNINGS ─────────────── */

export async function getEarnings(username: string): Promise<Earning[]> {
  if (USE_FIREBASE && db) {
    try {
      const q = query(collection(db, "earnings"), where("username", "==", username));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as unknown as Earning))
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      console.warn("Firebase earnings read failed, falling back to localStorage:", err);
    }
  }

  const local = readJSON<Earning[]>(EARNINGS_KEY(username)) || [];
  return local.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addEarning(username: string, earning: Omit<Earning, "id">): Promise<Earning> {
  const fullEarning: Earning = { ...earning, id: generateEarningId() };

  if (USE_FIREBASE && db) {
    try {
      await addDoc(collection(db, "earnings"), {
        ...fullEarning,
        createdAt: serverTimestamp(),
      });
      return fullEarning;
    } catch (err) {
      console.warn("Firebase earning write failed, falling back to localStorage:", err);
    }
  }

  const existing = readJSON<Earning[]>(EARNINGS_KEY(username)) || [];
  const updated = [fullEarning, ...existing];
  writeJSON(EARNINGS_KEY(username), updated);
  return fullEarning;
}

/* ─────────────── OPERATIONS ─────────────── */

export async function addMoney(username: string, amount: number, method = "Deposit"): Promise<Wallet> {
  if (amount <= 0) throw new Error("Amount must be greater than zero");
  const wallet = await getWallet(username);
  wallet.fiatBalance += amount;
  await writeWallet(wallet);
  await addTransaction(username, {
    username,
    label: `${method} Deposit`,
    amount,
    type: "credit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "TopUp",
  });
  return wallet;
}

export async function sendMoney(username: string, recipient: string, amount: number): Promise<{ success: boolean; error?: string; wallet?: Wallet }> {
  if (amount <= 0) return { success: false, error: "Amount must be greater than zero" };
  const wallet = await getWallet(username);
  if (wallet.fiatBalance < amount) return { success: false, error: "Insufficient balance" };

  wallet.fiatBalance -= amount;
  await writeWallet(wallet);
  await addTransaction(username, {
    username,
    label: `Sent to ${recipient}`,
    amount: -amount,
    type: "debit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Transfer",
  });

  // Credit recipient
  const recipientWallet = await getWallet(recipient);
  recipientWallet.fiatBalance += amount;
  await writeWallet(recipientWallet);
  await addTransaction(recipient, {
    username: recipient,
    label: `Payment from ${username}`,
    amount,
    type: "credit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Transfer",
  });

  return { success: true, wallet };
}

export async function topUpCoins(username: string, pkgIndex: number): Promise<{ success: boolean; error?: string; wallet?: Wallet }> {
  const pkg = coinPackages[pkgIndex];
  if (!pkg) return { success: false, error: "Invalid coin package" };

  const wallet = await getWallet(username);
  if (wallet.fiatBalance < pkg.price) return { success: false, error: "Insufficient fiat balance" };

  wallet.fiatBalance -= pkg.price;
  wallet.coinBalance += pkg.coins + pkg.bonus;
  await writeWallet(wallet);

  await addTransaction(username, {
    username,
    label: `Coin Purchase — ${pkg.coins + pkg.bonus} VOX Coins`,
    amount: -(pkg.price),
    type: "debit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Coins",
  });

  return { success: true, wallet };
}

export async function sendGift(
  senderUsername: string,
  recipientUsername: string,
  tierIndex: number,
): Promise<{ success: boolean; error?: string; senderWallet?: Wallet }> {
  const tier = giftTiers[tierIndex];
  if (!tier) return { success: false, error: "Invalid gift tier" };

  const sender = await getWallet(senderUsername);
  if (sender.coinBalance < tier.cost) return { success: false, error: "Not enough coins" };

  sender.coinBalance -= tier.cost;
  await writeWallet(sender);
  await addTransaction(senderUsername, {
    username: senderUsername,
    label: `Gift sent to ${recipientUsername} — ${tier.name}`,
    amount: -tier.cost,
    type: "debit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Gift",
  });

  // Credit creator earnings
  const creatorShare = tier.cost * 0.7; // 70% to creator
  const recipient = await getWallet(recipientUsername);
  recipient.coinBalance += 0; // creators earn fiat, not coins, from gifts
  recipient.lifetimeGiftsReceived += tier.cost;
  await writeWallet(recipient);

  await addEarning(recipientUsername, {
    username: recipientUsername,
    source: "gift",
    amount: creatorShare,
    createdAt: Date.now(),
  });

  return { success: true, senderWallet: sender };
}

export async function withdraw(username: string, amount: number): Promise<{ success: boolean; error?: string; wallet?: Wallet }> {
  if (amount <= 0) return { success: false, error: "Amount must be greater than zero" };
  const wallet = await getWallet(username);
  if (wallet.fiatBalance < amount) return { success: false, error: "Insufficient balance" };

  wallet.fiatBalance -= amount;
  wallet.pendingPayout += amount;
  await writeWallet(wallet);

  await addTransaction(username, {
    username,
    label: "Withdrawal Request",
    amount: -amount,
    type: "debit",
    time: new Date().toLocaleString("en-US"),
    status: "Pending",
    category: "Withdraw",
  });

  return { success: true, wallet };
}

export async function earnFromStream(
  username: string,
  amount: number,
  source: "gift" | "subscription" | "shop" | "auction" | "ad",
): Promise<Wallet> {
  const wallet = await getWallet(username);
  wallet.fiatBalance += amount;
  wallet.lifetimeEarnings += amount;
  await writeWallet(wallet);

  await addEarning(username, {
    username,
    source,
    amount,
    createdAt: Date.now(),
  });

  await addTransaction(username, {
    username,
    label: `${source === "gift" ? "Gift" : source === "subscription" ? "Subscription" : source === "shop" ? "Marketplace" : source === "auction" ? "Auction" : "Ad"} Earning`,
    amount,
    type: "credit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Earnings",
  });

  return wallet;
}

export async function deductCoins(
  username: string,
  amount: number,
): Promise<{ success: boolean; error?: string; wallet?: Wallet }> {
  if (amount <= 0) return { success: false, error: "Invalid coin amount" };
  const wallet = await getWallet(username);
  if (wallet.coinBalance < amount) return { success: false, error: "Not enough coins" };

  wallet.coinBalance -= amount;
  await writeWallet(wallet);

  await addTransaction(username, {
    username,
    label: `Gift sent — ${amount} VOX Coins`,
    amount: -amount,
    type: "debit",
    time: new Date().toLocaleString("en-US"),
    status: "Completed",
    category: "Gift",
  });

  return { success: true, wallet };
}
