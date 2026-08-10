"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Mic,
  MicOff,
  Volume2,
  PhoneOff,
  ImageIcon,
  Gift,
  Flag,
  VolumeX,
  ChevronRight,
  CheckCheck,
  Play,
  X,
  ArrowLeft,
  BadgeCheck,
  Flame,
  Paperclip,
  MapPin,
  FileText,
  Bell,
  BellOff,
  Trash2,
  Star,
  MessageSquare,
  LogOut,
  Eye,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { sendMessage, subscribeToMessages, subscribeToConversations, markMessagesAsRead, subscribeToTyping, setTypingStatus, uploadFile, compressImageForFirestore, type ChatMessage } from "@/lib/firebase-store";
import { getAccount, accounts } from "@/lib/accounts";
import { getWallet, deductCoins, earnFromStream } from "@/lib/wallet-store";

/* ───────────────────────────── HELPERS ───────────────────────────── */

function timeAgoShort(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

/* ───────────────────────────── TYPES ───────────────────────────── */

interface Chat {
  id: number;
  name: string;
  handle: string;
  username?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  verified: boolean;
  seller: boolean;
  avatar: string;
  avatarUrl: string;
  role?: string;
  followers?: string;
  likes?: string;
  isVoice?: boolean;
  isPhoto?: boolean;
  starred?: boolean;
  isGroup?: boolean;
}

interface Message {
  id: number;
  sender: "me" | "them";
  type: "text" | "image" | "voice" | "gift";
  content: string;
  time: string;
  read: boolean;
}

/* ───────────────────────────── DATA ────────────────────────────── */

const initialChats: Chat[] = [
  {
    id: 1,
    name: "JUST WEAR WIGS",
    handle: "@just_wearwigs",
    username: "just_wearwigs",
    lastMessage: "Your wig order is ready for pickup! 💇‍♀️",
    time: "2m",
    unread: 2,
    online: true,
    verified: true,
    seller: true,
    avatar: "from-purple-500 to-pink-500",
    avatarUrl: "/profiles/justwearwigs/avatar.jpeg",
    role: "Seller",
    followers: "2,096",
    likes: "48.6K",
  },
  {
    id: 2,
    name: "Glow By Nana",
    handle: "@glowbynana",
    username: "glowbynana",
    lastMessage: "I can fit you in tomorrow at 2pm ✨",
    time: "15m",
    unread: 1,
    online: true,
    verified: true,
    seller: true,
    avatar: "from-cyan-400 to-blue-500",
    avatarUrl: "https://images.unsplash.com/photo-1763328728510-064ea03a1f8a?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Seller",
    followers: "1.2M",
    likes: "890K",
  },
  {
    id: 3,
    name: "Berry Beauty",
    handle: "@berrybeauty",
    username: "berrybeauty",
    lastMessage: "The frontal ponytail tutorial is up! 🔥",
    time: "1h",
    unread: 0,
    online: true,
    verified: true,
    seller: true,
    avatar: "from-green-400 to-emerald-500",
    avatarUrl: "https://images.unsplash.com/photo-1761661769337-1efb17d08a91?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Creator",
    followers: "890K",
    likes: "12.1M",
  },
  {
    id: 4,
    name: "Hair By Maame",
    handle: "@hairbymaame",
    username: "hairbymaame",
    lastMessage: "Sent you a gift 🎁",
    time: "3h",
    unread: 0,
    online: false,
    verified: false,
    seller: true,
    avatar: "from-pink-400 to-rose-500",
    avatarUrl: "https://images.unsplash.com/photo-1745975980824-bc88bd400c78?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Seller",
    followers: "650K",
    likes: "8.4M",
  },
  {
    id: 5,
    name: "Wigs By Akua",
    handle: "@wigsbyakua",
    username: "wigsbyakua",
    lastMessage: "Your lace frontal order has shipped! 📦",
    time: "5h",
    unread: 0,
    online: false,
    verified: false,
    seller: true,
    avatar: "from-orange-400 to-amber-500",
    avatarUrl: "https://images.unsplash.com/photo-1650649016849-00938690600c?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Seller",
    followers: "420K",
    likes: "5.8M",
  },
  {
    id: 6,
    name: "VOXel Beauty Hub",
    handle: "@voxelbeauty",
    lastMessage: "Flash sale on hair extensions! 50% off 🔥",
    time: "Yesterday",
    unread: 0,
    online: false,
    verified: true,
    seller: false,
    avatar: "from-violet-500 to-purple-600",
    avatarUrl: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "System",
    followers: "5.2M",
    likes: "32M",
    isGroup: true,
  },
  {
    id: 7,
    name: "Afro Queen",
    handle: "@afroqueen",
    username: "afroqueen",
    lastMessage: "Sent a voice message about natural hair care",
    time: "Yesterday",
    unread: 0,
    online: false,
    verified: true,
    seller: false,
    avatar: "from-teal-400 to-cyan-500",
    avatarUrl: "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Creator",
    followers: "2.1M",
    likes: "18.4M",
    isVoice: true,
  },
  {
    id: 8,
    name: "Slayed By Esi",
    handle: "@slayedbyesi",
    username: "slayedbyesi",
    lastMessage: "Sent a photo of the wig install 💇‍♀️",
    time: "2 days ago",
    unread: 0,
    online: false,
    verified: false,
    seller: true,
    avatar: "from-yellow-400 to-orange-500",
    avatarUrl: "https://images.unsplash.com/photo-1765607476283-ca2d8201ddd4?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces",
    role: "Seller",
    followers: "340K",
    likes: "4.2M",
    isPhoto: true,
  },
  {
    id: 9,
    name: "SNY Obeng",
    handle: "@snyobeng",
    username: "snyobeng",
    lastMessage: "Check out my latest YouTube video! 🎬",
    time: "3 days ago",
    unread: 0,
    online: false,
    verified: true,
    seller: false,
    avatar: "from-indigo-500 to-purple-600",
    avatarUrl: "/profiles/snyobeng/123121.jpeg",
    role: "Creator",
    followers: "892",
    likes: "12.4K",
  },
];

const conversationMessages: Message[] = [
  {
    id: 1,
    sender: "them",
    type: "text",
    content: "Hey! Your ready-to-wear wig order is ready for pickup 💇‍♀️",
    time: "2:15 PM",
    read: true,
  },
  {
    id: 2,
    sender: "me",
    type: "text",
    content: "Amazing! Can I pick it up tomorrow?",
    time: "2:16 PM",
    read: true,
  },
  {
    id: 3,
    sender: "them",
    type: "text",
    content: "Yes! We're open 9am-6pm. The body wave came out gorgeous ✨",
    time: "2:17 PM",
    read: true,
  },
  {
    id: 4,
    sender: "them",
    type: "image",
    content: "wig_photo.jpg",
    time: "2:18 PM",
    read: true,
  },
  {
    id: 5,
    sender: "me",
    type: "text",
    content: "Omg that's beautiful! I'll definitely be there tomorrow",
    time: "2:20 PM",
    read: true,
  },
  {
    id: 6,
    sender: "them",
    type: "voice",
    content: "0:34",
    time: "2:21 PM",
    read: true,
  },
  {
    id: 7,
    sender: "me",
    type: "gift",
    content: "Sent a Rose gift (100 coins)",
    time: "2:22 PM",
    read: true,
  },
  {
    id: 8,
    sender: "them",
    type: "text",
    content: "Thank you so much! See you tomorrow 💕",
    time: "2:23 PM",
    read: true,
  },
];

const tabFilters = ["All", "Unread", "Groups", "Sellers"] as const;

/* ─────────────── WAVEFORM VISUALIZATION ─────────────── */

function WaveformBars({ playing }: { playing: boolean }) {
  const bars = [3, 5, 8, 4, 7, 9, 5, 3, 6, 8, 4, 7, 5, 9, 3, 6, 8, 4, 7, 5, 3, 8, 6, 4, 7];
  return (
    <div className="flex items-center gap-[2px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white/70"
          initial={{ height: `${h * 3}px` }}
          animate={
            playing
              ? { height: [`${h * 3}px`, `${(10 - h) * 3 + 6}px`, `${h * 3}px`] }
              : { height: `${h * 3}px` }
          }
          transition={
            playing
              ? {
                  repeat: Infinity,
                  duration: 0.6 + Math.random() * 0.4,
                  delay: i * 0.03,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </div>
  );
}

/* ───────────────────── SHARED MEDIA GRADIENTS ───────────────────── */

const mediaGradients = [
  "bg-gradient-to-br from-vox-purple/40 to-vox-pink/30",
  "bg-gradient-to-br from-vox-pink/30 to-vox-orange/40",
  "bg-gradient-to-br from-vox-cyan/30 to-vox-purple/30",
  "bg-gradient-to-br from-vox-orange/30 to-vox-pink/30",
  "bg-gradient-to-br from-vox-green/30 to-vox-cyan/30",
  "bg-gradient-to-br from-vox-purple/30 to-vox-cyan/40",
];

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════════ */

export default function MessagesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [chatsList, setChatsList] = useState<Chat[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [selectedChatUsername, setSelectedChatUsername] = useState<string>("just_wearwigs");
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>(conversationMessages);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  // Get the active chat - try by ID first, then by username, then fallback to first
  const activeChat = chatsList.find((c) => c.id === selectedChatId) ||
    chatsList.find((c) => c.username === selectedChatUsername) ||
    chatsList[0];
  const activeChatUsername = activeChat?.username || activeChat?.handle?.replace("@", "") || "";

  // Track whether we've received any real-time messages for this chat
  const [hasRealtimeData, setHasRealtimeData] = useState(false);

  // Open a specific chat from profile "Message" button
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = window.localStorage.getItem("voxel_open_chat");
    if (!target || !currentUser) return;
    window.localStorage.removeItem("voxel_open_chat");
    const account = getAccount(target);
    if (!account) return;
    setSelectedChatUsername(target);
    setChatsList((prev) => {
      if (prev.some((c) => c.username === target || c.handle === `@${target}`)) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          name: account.name,
          handle: `@${account.username}`,
          username: account.username,
          lastMessage: "",
          time: "Now",
          unread: 0,
          online: false,
          verified: account.verified ?? false,
          seller: account.isSeller ?? false,
          avatar: account.avatar,
          avatarUrl: account.avatar,
          starred: false,
        },
      ];
    });
  }, [currentUser]);

  // Subscribe to real-time messages from Firebase
  useEffect(() => {
    if (!currentUser || !activeChatUsername) {
      setRealtimeMessages([]);
      setHasRealtimeData(false);
      return;
    }
    setHasRealtimeData(false);
    const unsubscribe = subscribeToMessages(
      currentUser.username,
      activeChatUsername,
      (msgs) => {
        setRealtimeMessages(msgs);
        setHasRealtimeData(true); // We got a response from Firebase (even if empty)
      },
    );
    return () => unsubscribe();
  }, [currentUser, activeChatUsername]);

  // Typing indicator subscription
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  useEffect(() => {
    if (!currentUser || !activeChatUsername) {
      setOtherUserTyping(false);
      return;
    }
    const unsubscribe = subscribeToTyping(
      currentUser.username,
      activeChatUsername,
      (isTyping) => setOtherUserTyping(isTyping),
    );
    return () => unsubscribe();
  }, [currentUser, activeChatUsername]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!currentUser || !activeChatUsername || !hasRealtimeData) return;
    markMessagesAsRead(currentUser.username, activeChatUsername).catch(() => {});
  }, [currentUser, activeChatUsername, hasRealtimeData, realtimeMessages.length]);

  // Show real-time messages from Firebase when available, otherwise show demo messages
  useEffect(() => {
    if (!hasRealtimeData) return; // Still loading from Firebase
    if (realtimeMessages.length > 0) {
      const mapped: Message[] = realtimeMessages.map((m) => ({
        id: Date.now() + Math.random(),
        sender: m.senderUsername === currentUser?.username ? "me" : "them",
        type: m.type === "image" ? "image" : "text",
        content: m.content,
        time: new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        read: m.read,
      }));
      setMessages(mapped);
    } else {
      // No messages in Firebase yet for this conversation - show empty state
      setMessages([]);
    }
  }, [realtimeMessages, hasRealtimeData, currentUser]);

  // Subscribe to all conversations for this user (real-time)
  const [realConversations, setRealConversations] = useState<{ username: string; lastMessage: string; lastMessageTime: number; unread: number }[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToConversations(currentUser.username, (convs) => {
      setRealConversations(convs);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Merge real conversations with seed chats - real ones take priority
  useEffect(() => {
    if (!currentUser || realConversations.length === 0) return;

    // Build a map of real conversation usernames for quick lookup
    const realConvMap = new Map(realConversations.map(c => [c.username, c]));

    // Get account info for real conversation users
    let nextId = 100;
    const realChats: Chat[] = [];
    const seedChats: Chat[] = [];

    for (const conv of realConversations) {
      const account = getAccount(conv.username);
      realChats.push({
        id: nextId++,
        name: account?.name || conv.username,
        handle: `@${conv.username}`,
        username: conv.username,
        lastMessage: conv.lastMessage,
        time: timeAgoShort(conv.lastMessageTime),
        unread: conv.unread,
        online: false,
        verified: account?.verified || false,
        seller: account?.isSeller || false,
        avatar: "from-vox-purple to-vox-pink",
        avatarUrl: account?.avatar || "",
        role: account?.isSeller ? "Seller" : "",
        followers: account?.followers || "0",
        likes: "0",
      });
    }

    // Keep seed chats that don't have real conversations
    for (const seedChat of initialChats) {
      if (!realConvMap.has(seedChat.username || "")) {
        seedChats.push(seedChat);
      }
    }

    // Real conversations first (already sorted by time), then seed chats
    setChatsList([...realChats, ...seedChats]);
  }, [realConversations, currentUser]);

  const [callState, setCallState] = useState<{ active: boolean; type: "voice" | "video"; duration: number }>({ active: false, type: "voice", duration: 0 });
  const [callMuted, setCallMuted] = useState(false);
  const [callSpeaker, setCallSpeaker] = useState(false);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [searchInChat, setSearchInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getWallet(currentUser.username).then((w) => {
      if (active) setCoinBalance(w.coinBalance);
    });
    return () => { active = false; };
  }, [currentUser]);

  /* ─────────────────────── CALL CONTROLS ─────────────────────── */
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const startCall = (type: "voice" | "video") => {
    setCallMuted(false);
    setCallSpeaker(false);
    setCallState({ active: true, type, duration: 0 });
    callTimerRef.current = setInterval(() => {
      setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  };

  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallState({ active: false, type: "voice", duration: 0 });
  };

  /* clear call timer on unmount */
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  /* ─────────────────────── CHAT ACTIONS ─────────────────────── */
  const isGroupChat = (chat: Chat) => !!chat.isGroup;

  const handleDeleteChat = () => {
    setChatsList((prev) => prev.filter((c) => c.id !== selectedChatId));
    showToast("Conversation deleted");
    setShowMobileChat(false);
    setSelectedChatId(chatsList[0]?.id ?? 0);
  };

  const handleBlockChat = () => {
    setShowBlockModal(false);
    showToast(`${activeChat.name} blocked`);
    setChatsList((prev) => prev.filter((c) => c.id !== selectedChatId));
    setShowMobileChat(false);
    setSelectedChatId(chatsList[0]?.id ?? 0);
  };

  const handleClearChat = () => {
    setMessages([]);
    showToast("Chat cleared");
  };

  const handleLeaveGroup = () => {
    if (!isGroupChat(activeChat)) {
      showToast("This is not a group chat");
      return;
    }
    setChatsList((prev) => prev.filter((c) => c.id !== selectedChatId));
    showToast("Left group");
    setShowMobileChat(false);
    setSelectedChatId(chatsList[0]?.id ?? 0);
  };

  const handleToggleFavorite = () => {
    setChatsList((prev) =>
      prev.map((c) => (c.id === selectedChatId ? { ...c, starred: !c.starred } : c))
    );
    showToast(activeChat.starred ? "Removed from favorites" : "Added to favorites");
  };

  const handleMarkUnread = () => {
    setChatsList((prev) =>
      prev.map((c) => (c.id === selectedChatId ? { ...c, unread: 1 } : c))
    );
    showToast("Marked as unread");
    setShowMobileChat(false);
  };

  const handleSelectMessages = () => {
    setSelectMode(true);
    setSelectedMessages([]);
    showToast("Selection mode enabled");
  };

  const handleSearchInChat = () => {
    setSearchInChat(true);
    setSearchInChatQuery("");
  };

  const handleViewMedia = () => {
    if (mediaGradients.length > 0) {
      setShowRightPanel(true);
      showToast("Showing shared media");
    } else {
      showToast("No shared media");
    }
  };

  const handleReportSubmit = () => {
    setShowReportModal(false);
    showToast(reportReason ? `Report submitted: ${reportReason}` : "Report submitted");
    setReportReason("");
  };

  const toggleSelectMessage = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  /* auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, messages]);

  /* filter chats */
  const filteredChats = chatsList.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "Unread") return matchesSearch && chat.unread > 0;
    if (activeTab === "Groups") return matchesSearch && (chat.name === "Marketplace Updates" || chat.name === "VOX Support");
    if (activeTab === "Sellers") return matchesSearch && chat.seller;
    return matchesSearch;
  });

  const handleSend = async () => {
    if (!messageInput.trim() || !currentUser) return;
    const text = messageInput.trim();
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    // Optimistic update
    const newMsg: Message = {
      id: Date.now(),
      sender: "me",
      type: "text",
      content: text,
      time,
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");

    // Send via Firebase (or localStorage fallback)
    try {
      await sendMessage({
        senderUsername: currentUser.username,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        receiverUsername: activeChatUsername,
        content: text,
        type: "text",
      });
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleSendGift = (gift: { emoji: string; name: string; cost: number }) => {
    if (!currentUser) {
      showToast("Sign in to send gifts");
      return;
    }
    if (!activeChatUsername) return;

    deductCoins(currentUser.username, gift.cost).then((res) => {
      if (res.success && res.wallet) {
        setCoinBalance(res.wallet.coinBalance);
        const newMsg: Message = {
          id: messages.length + 1,
          sender: "me",
          type: "gift",
          content: `Sent a ${gift.name} (${gift.cost} coins) ${gift.emoji}`,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          read: false,
        };
        setMessages([...messages, newMsg]);
        setShowGiftPanel(false);
        showToast(`${gift.emoji} ${gift.name} sent!`);

        // Credit recipient with 70% of gift value
        earnFromStream(activeChatUsername, Math.floor(gift.cost * 0.7), "gift");
      } else {
        showToast(res.error || "Not enough coins");
      }
    });
  };

  const handleSelectChat = (id: number) => {
    const chat = chatsList.find(c => c.id === id);
    setSelectedChatId(id);
    if (chat?.username) setSelectedChatUsername(chat.username);
    setShowMobileChat(true);
    // Don't reset messages here - the real-time subscription will handle it
    // Show empty state until Firebase data loads
    setHasRealtimeData(false);
    setMessages([]);
  };

  const msgPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleAttach = (label: string) => {
    if (label === "Photo") {
      msgPhotoInputRef.current?.click();
      return;
    }
    if (label === "Location") {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "me",
        type: "text",
        content: "📍 Shared location: Accra, Ghana",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        read: false,
      };
      setMessages([...messages, newMsg]);
      showToast("Location shared");
    } else {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "me",
        type: "text",
        content: label === "Video" ? "🎥 Video" : "📄 File",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        read: false,
      };
      setMessages([...messages, newMsg]);
      showToast(`${label} attached`);
    }
  };

  const handleMsgPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const tempMsg: Message = {
      id: Date.now(),
      sender: "me",
      type: "image",
      content: previewUrl,
      time,
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    showToast("Photo sent");

    try {
      const compressed = await compressImageForFirestore(file, 700000);
      const { url } = await uploadFile(compressed, `messages/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
      await sendMessage({
        senderUsername: currentUser.username,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        receiverUsername: activeChatUsername,
        content: url,
        type: "image",
      });
      // Replace preview with real URL
      setMessages((prev) => prev.map((m) => m.id === tempMsg.id ? { ...m, content: url } : m));
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      console.error("Photo send error:", err);
      showToast("Failed to send photo");
    }
    e.target.value = "";
  };

  const giftOptions = [
    { emoji: "❤️", name: "Heart", cost: 50 },
    { emoji: "🌹", name: "Rose", cost: 100 },
    { emoji: "🔥", name: "Fire", cost: 200 },
    { emoji: "💎", name: "Diamond", cost: 500 },
  ];

  const attachOptions = [
    { icon: ImageIcon, label: "Photo", color: "text-vox-cyan" },
    { icon: Video, label: "Video", color: "text-vox-purple" },
    { icon: FileText, label: "File", color: "text-vox-orange" },
    { icon: MapPin, label: "Location", color: "text-vox-green" },
  ];

  const optionMenuItems = [
    { icon: isMuted ? Bell : BellOff, label: isMuted ? "Unmute" : "Mute", action: () => { setIsMuted(!isMuted); showToast(isMuted ? "Unmuted" : "Muted"); } },
    { icon: Star, label: activeChat.starred ? "Remove from Favorites" : "Add to Favorites", action: handleToggleFavorite },
    { icon: Search, label: "Search in Chat", action: handleSearchInChat },
    { icon: MessageSquare, label: "Select Messages", action: handleSelectMessages },
    { icon: Eye, label: "View Media", action: handleViewMedia },
    { icon: ImageIcon, label: "View Shared", action: handleViewMedia },
    { icon: Bell, label: "Mark as Unread", action: handleMarkUnread },
    { icon: Trash2, label: "Clear Chat", action: handleClearChat },
    { icon: LogOut, label: "Leave Group", action: handleLeaveGroup },
    { icon: Flag, label: "Report", action: () => setShowReportModal(true) },
    { icon: Trash2, label: "Delete", action: handleDeleteChat },
    { icon: Flag, label: "Block", action: () => setShowBlockModal(true) },
  ];

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="flex h-screen pb-16 lg:pb-0">
      {/* ═══════════════════ LEFT PANEL - CHAT LIST ═══════════════════ */}
      <aside
        className={`w-full lg:w-80 flex-shrink-0 lg:border-r lg:border-white/[0.06] flex flex-col bg-vox-bg ${
          showMobileChat ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 pb-2 flex items-center justify-between flex-shrink-0" style={{ paddingTop: "var(--safe-top)" }}>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-vox-purple" />
            Messages
          </h1>
          <button
            onClick={() => setShowNewMessage(true)}
            className="w-10 h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white hover:border-vox-purple/40 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 sm:px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.06] rounded-full pl-11 pr-4 py-2 text-base text-white placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-3 sm:px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
          {tabFilters.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full touch-feedback whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? "glass text-white"
                  : "text-vox-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          <AnimatePresence>
            {filteredChats.map((chat, i) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 sm:p-4 touch-feedback rounded-xl transition-all duration-200 text-left group active:bg-white/[0.04] ${
                  selectedChatId === chat.id
                    ? "glass-strong border-vox-purple/30 shadow-lg shadow-vox-purple/5"
                    : "hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${chat.avatar} p-[2px] ${
                      chat.online ? "ring-2 ring-vox-green ring-offset-2 ring-offset-vox-bg" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chat.avatarUrl}
                      alt={chat.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {chat.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-vox-green rounded-full border-2 border-vox-bg" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-semibold text-white truncate flex-1">
                        {chat.name}
                      </span>
                      {chat.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-vox-cyan flex-shrink-0" />
                      )}
                      {chat.seller && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-vox-orange/20 text-vox-orange flex-shrink-0">
                          SELLER
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-vox-muted flex-shrink-0 ml-2">
                      {chat.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-vox-muted truncate pr-2 flex items-center gap-1">
                      {chat.isVoice && <Mic className="w-3 h-3 text-vox-purple flex-shrink-0" />}
                      {chat.isPhoto && (
                        <ImageIcon className="w-3 h-3 text-vox-cyan flex-shrink-0" />
                      )}
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="bg-vox-pink text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center flex-shrink-0 px-1">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-vox-muted">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-3 text-vox-muted" />
              <p className="text-base font-semibold">No conversations</p>
              <p className="text-sm text-vox-muted">Start a new chat</p>
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════ CENTER PANEL - CONVERSATION ═══════════════════ */}
      <main
        className={`flex-1 flex flex-col min-w-0 bg-vox-bg ${
          !showMobileChat ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-5 border-b border-white/[0.06] glass-strong backdrop-blur-xl flex-shrink-0" style={{ paddingTop: "var(--safe-top)", paddingBottom: "0.5rem" }}>
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button
              onClick={() => setShowMobileChat(false)}
              className="lg:hidden w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar - clickable to view profile */}
            <Link href={activeChat.username ? `/profile/${activeChat.username}` : "/profile"} className="relative">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${activeChat.avatar} p-[2px]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeChat.avatarUrl}
                  alt={activeChat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {activeChat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-vox-green rounded-full border-2 border-vox-panel" />
              )}
            </Link>

            {/* Info - clickable to view profile */}
            <Link href={activeChat.username ? `/profile/${activeChat.username}` : "/profile"}>
              <div>
                <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">{activeChat.name}</span>
                {activeChat.verified && <BadgeCheck className="w-3.5 h-3.5 text-vox-cyan" />}
                {activeChat.role === "Creator" && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-vox-purple/20 text-vox-purple uppercase tracking-wide flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    Creator
                  </span>
                )}
              </div>
              <p className={`text-[10px] ${activeChat.online ? "text-vox-green" : "text-vox-muted"}`}>
                {activeChat.online ? "Online" : "Last seen recently"}
              </p>
              </div>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => startCall("video")}
              className="w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-vox-green transition-all duration-200"
            >
              <Video className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => startCall("voice")}
              className="w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-vox-cyan transition-all duration-200"
            >
              <Phone className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="w-9 h-9 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-all duration-200"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
            <AnimatePresence>
              {showOptionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-11 z-50 glass rounded-xl p-2 min-w-[160px] sm:min-w-[180px] shadow-2xl"
                >
                  {optionMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setShowOptionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg touch-feedback hover:bg-white/[0.06] text-sm text-vox-muted hover:text-white transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search-in-chat / Select mode bar */}
        <AnimatePresence>
          {(searchInChat || selectMode) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/[0.06] flex-shrink-0"
            >
              {searchInChat ? (
                <div className="flex items-center gap-2 px-3 sm:px-4 lg:px-5 py-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search in this chat..."
                      value={searchInChatQuery}
                      onChange={(e) => setSearchInChatQuery(e.target.value)}
                      className="w-full bg-white/[0.06] rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 transition-all duration-200"
                    />
                  </div>
                  <button
                    onClick={() => { setSearchInChat(false); setSearchInChatQuery(""); }}
                    className="w-8 h-8 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 sm:px-4 lg:px-5 py-2.5">
                  <span className="text-xs text-vox-muted">
                    {selectedMessages.length > 0 ? `${selectedMessages.length} selected` : "Tap messages to select"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectMode(false); setSelectedMessages([]); }}
                      className="text-xs text-vox-muted hover:text-white touch-feedback px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 space-y-3 relative" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Subtle background pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,44,255,0.04)_0%,transparent_60%)]" />

          {/* Date separator */}
          <div className="flex items-center justify-center py-2 relative z-10">
            <span className="text-[10px] text-vox-muted text-center py-2">
              Today
            </span>
          </div>

          {/* Empty state */}
          {hasRealtimeData && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-vox-muted" />
              </div>
              <p className="text-vox-muted text-sm font-medium">No messages yet</p>
              <p className="text-vox-muted/60 text-xs mt-1">Send a message to start the conversation</p>
            </div>
          )}

          {/* Loading state */}
          {!hasRealtimeData && messages.length === 0 && (
            <div className="flex items-center justify-center py-20 relative z-10">
              <div className="w-6 h-6 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
            </div>
          )}

          {messages
            .filter((msg) =>
              searchInChat && searchInChatQuery
                ? msg.content.toLowerCase().includes(searchInChatQuery.toLowerCase())
                : true
            )
            .map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
              className={`flex relative z-10 items-center gap-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              {selectMode && msg.sender === "them" && (
                <button
                  onClick={() => toggleSelectMessage(msg.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedMessages.includes(msg.id)
                      ? "bg-vox-purple border-vox-purple"
                      : "border-vox-muted/50"
                  }`}
                >
                  {selectedMessages.includes(msg.id) && <Check className="w-3 h-3 text-white" />}
                </button>
              )}
              <div className="max-w-[75%] sm:max-w-[60%]">
                {/* Text Message */}
                {msg.type === "text" && (
                  <div
                    onClick={selectMode ? () => toggleSelectMessage(msg.id) : undefined}
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm ${
                      msg.sender === "me"
                        ? "btn-gradient text-white rounded-br-md"
                        : "glass text-white/90 rounded-bl-md"
                    } ${selectMode ? "cursor-pointer" : ""} ${selectMode && selectedMessages.includes(msg.id) ? "ring-2 ring-vox-purple" : ""}`}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[9px] text-vox-muted">{msg.time}</span>
                      {msg.sender === "me" && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-vox-cyan" : "text-vox-muted"}`} />
                      )}
                    </div>
                  </div>
                )}

                {/* Image Message */}
                {msg.type === "image" && (
                  <div className="rounded-2xl overflow-hidden glass rounded-bl-md">
                    <div className="rounded-2xl overflow-hidden w-48 h-36 sm:w-64 sm:h-44 relative group cursor-pointer touch-feedback">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.content.startsWith("http") || msg.content.startsWith("blob:") ? msg.content : "https://images.unsplash.com/photo-1770445612539-1a49772a1c3f?fm=jpg&q=60&w=400&h=300&auto=format&fit=crop"}
                        alt="Shared image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-[9px] text-vox-muted">
                        {msg.content}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-start">
                      <span className="text-[9px] text-vox-muted">{msg.time}</span>
                    </div>
                  </div>
                )}

                {/* Voice Message */}
                {msg.type === "voice" && (
                  <div className="glass rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2">
                    <button
                      onClick={() => setPlayingVoice(playingVoice === msg.id ? null : msg.id)}
                      className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center transition-all flex-shrink-0 touch-feedback"
                    >
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                    <div className="flex-1">
                      <WaveformBars playing={playingVoice === msg.id} />
                    </div>
                    <span className="text-xs text-vox-muted flex-shrink-0">{msg.content}</span>
                    <div className="flex items-center">
                      <span className="text-[9px] text-vox-muted">{msg.time}</span>
                    </div>
                  </div>
                )}

                {/* Gift Message */}
                {msg.type === "gift" && (
                  <div className="rounded-2xl overflow-hidden rounded-br-md">
                    <div className="glass rounded-2xl rounded-br-md px-4 py-3 sm:px-5 sm:py-4 text-center relative">
                      {/* Sparkle decorations */}
                      <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-vox-pink/60 rounded-full animate-pulse" />
                      <div className="absolute top-4 right-4 w-1 h-1 bg-vox-purple/60 rounded-full animate-pulse" />
                      <div className="absolute bottom-3 left-5 w-1 h-1 bg-vox-orange/60 rounded-full animate-pulse" />

                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-vox-pink to-vox-danger mb-2"
                      >
                        <Gift className="w-6 h-6 text-white" />
                      </motion.div>
                      <p className="text-sm font-medium text-white/90">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span className="text-[9px] text-vox-muted">{msg.time}</span>
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-vox-cyan" : "text-vox-muted"}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {otherUserTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start relative z-10"
              >
                <div className="glass rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-vox-muted"
                    />
                  ))}
                  <span className="text-[10px] sm:text-[11px] text-vox-muted ml-1">typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass-strong border-t border-white/[0.06] p-3 flex-shrink-0" style={{ paddingBottom: "var(--safe-bottom)" }}>
          <div className="flex items-end gap-2">
            {/* Attachment */}
            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-vox-purple transition-all duration-200 flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  if (currentUser && activeChatUsername && e.target.value.trim()) {
                    setTypingStatus(currentUser.username, activeChatUsername, true).catch(() => {});
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="w-full flex-1 bg-white/[0.06] rounded-full px-4 py-2.5 text-base text-white placeholder:text-vox-muted/50 focus:outline-none focus:border-vox-purple/40 transition-all duration-200 pr-24 sm:pr-28"
              />
              {/* Inline buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-7 h-7 sm:w-8 sm:h-8 touch-feedback rounded-lg flex items-center justify-center text-vox-muted/60 hover:text-vox-orange transition-colors">
                  <Smile className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => setShowGiftPanel(!showGiftPanel)} className="w-7 h-7 sm:w-8 sm:h-8 touch-feedback rounded-lg flex items-center justify-center text-vox-muted/60 hover:text-vox-pink transition-colors">
                  <Gift className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-7 h-7 sm:w-8 sm:h-8 touch-feedback rounded-lg flex items-center justify-center text-vox-muted/60 hover:text-vox-cyan transition-colors">
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Gift Panel */}
              <AnimatePresence>
                {showGiftPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 right-0 z-20 glass rounded-2xl p-3 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-medium text-white">Send a Gift</span>
                      <span className="text-xs text-vox-orange font-medium">{coinBalance.toLocaleString()} coins</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {giftOptions.map((gift) => (
                        <button
                          key={gift.name}
                          onClick={() => handleSendGift(gift)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl touch-feedback hover:bg-white/10 transition-colors"
                        >
                          <span className="text-2xl">{gift.emoji}</span>
                          <span className="text-[9px] text-vox-muted">{gift.cost}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 right-0 z-20 glass rounded-2xl p-3 shadow-2xl max-w-[90vw] sm:max-w-[260px]"
                  >
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                      {["😀","😂","🥰","😍","😎","🤩","😘","🥳","😢","😡","👍","👎","❤️","🔥","🎉","💯","🙏","💪","✨","🌟","🎁","🌹","💎","👑","🎵","🎶","💃","🕺","🚀","🏆","🤗","😴"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { setMessageInput(prev => prev + emoji); }}
                          className="w-7 h-7 text-lg touch-feedback rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attach Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 right-0 z-20 glass rounded-2xl p-3 shadow-2xl"
                  >
                    <div className="grid grid-cols-2 gap-2 min-w-[160px] sm:min-w-[180px]">
                      {attachOptions.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => { handleAttach(opt.label); setShowAttachMenu(false); }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl touch-feedback hover:bg-white/10 transition-colors"
                        >
                          <opt.icon className={`w-5 h-5 ${opt.color}`} />
                          <span className="text-[11px] text-white">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Send */}
            {messageInput.trim() ? (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleSend}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full btn-gradient touch-feedback flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-vox-pink/20"
              >
                <Send className="w-[18px] h-[18px] -rotate-45" />
              </motion.button>
            ) : (
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-vox-pink transition-all duration-200 flex-shrink-0">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════════════ RIGHT PANEL - CONTACT INFO ═══════════════════ */}
      <AnimatePresence>
        {showRightPanel && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="hidden xl:flex flex-col flex-shrink-0 border-l border-white/[0.06] bg-vox-bg overflow-hidden"
          >
            <div className="w-[280px] flex flex-col h-full overflow-y-auto">
              {/* Close button */}
              <div className="flex justify-end p-3 flex-shrink-0">
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="w-8 h-8 rounded-lg touch-feedback flex items-center justify-center text-vox-muted/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Section */}
              <div className="flex flex-col items-center px-5 pb-5">
                {/* Large Avatar */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[2.5px]">
                    <div className="w-full h-full rounded-full bg-vox-bg flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeChat.avatarUrl}
                        alt={activeChat.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  {activeChat.online && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-vox-green rounded-full border-[3px] border-vox-bg" />
                  )}
                </div>

                {/* Name & Handle */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-bold text-white text-base">{activeChat.name}</h3>
                  {activeChat.verified && <BadgeCheck className="w-4 h-4 text-vox-cyan" />}
                </div>
                <p className="text-xs text-vox-muted mb-1.5">{activeChat.handle}</p>

                {/* Role Badge */}
                {activeChat.role && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-vox-purple/20 to-vox-pink/20 text-vox-purple border border-vox-purple/20 mb-4">
                    {activeChat.role}
                  </span>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mb-5">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{activeChat.followers}</p>
                    <p className="text-[10px] text-vox-muted/60 uppercase tracking-wider">Followers</p>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{activeChat.likes}</p>
                    <p className="text-[10px] text-vox-muted/60 uppercase tracking-wider">Likes</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full mb-2">
                  <button
                    onClick={() => { setIsFollowing(!isFollowing); showToast(isFollowing ? "Unfollowed" : "Following!"); }}
                    className={`flex-1 py-2 rounded-xl touch-feedback text-xs font-semibold transition-all ${isFollowing ? "glass text-vox-muted" : "btn-gradient text-white"}`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex-1 py-2 rounded-xl glass touch-feedback text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
                <button
                  onClick={() => { setIsMuted(!isMuted); showToast(isMuted ? "Notifications on" : "Notifications muted"); }}
                  className="w-full py-2 rounded-xl glass touch-feedback text-xs font-medium text-vox-muted hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                >
                  {isMuted ? <Bell className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mx-5" />

              {/* Shared Media */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Shared Media
                  </h4>
                  <button className="text-[11px] text-vox-purple touch-feedback hover:text-vox-pink transition-colors flex items-center gap-0.5">
                    See All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {mediaGradients.map((gradient, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg overflow-hidden touch-feedback cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-[1.03] ${gradient} flex items-center justify-center relative`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://images.unsplash.com/photo-${[1770445612539, 1650649016849, 1745975980824, 1763328728510, 1761661769337, 1765607476283][i % 6]}?fm=jpg&q=60&w=100&h=100&auto=format&fit=crop`}
                        alt={`Shared media ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {i === 0 && <Play className="w-4 h-4 text-white/80 relative z-10" />}
                      {i !== 0 && <ImageIcon className="w-4 h-4 text-white/20 relative z-10" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Block & Report */}
              <div className="p-5 pt-2 flex-shrink-0">
                <div className="h-px bg-white/[0.06] mb-4" />
                <button
                  onClick={() => setShowBlockConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl touch-feedback text-xs font-medium text-vox-danger/70 hover:text-vox-danger hover:bg-vox-danger/10 border border-transparent hover:border-vox-danger/20 transition-all duration-200"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Block &amp; Report
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══════ CALL OVERLAY ═══════ */}
      <AnimatePresence>
        {callState.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[3px]">
                <div className="w-full h-full rounded-full bg-vox-bg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{activeChat.name}</h3>
                <p className="text-sm text-vox-muted mt-1 flex items-center gap-2 justify-center">
                  {callState.type === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  {callState.type === "video" ? "Video" : "Voice"} Call • {formatDuration(callState.duration)}
                </p>
                <p className="text-xs text-vox-green animate-pulse mt-1">Connected</p>
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setCallMuted(!callMuted)}
                  className={`w-14 h-14 rounded-full glass flex items-center justify-center touch-feedback transition-all ${callMuted ? "bg-vox-purple/30" : ""}`}
                >
                  {callMuted ? <MicOff className="w-6 h-6 text-vox-purple" /> : <Mic className="w-6 h-6 text-white" />}
                </button>
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-600 touch-feedback hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg shadow-red-600/40"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={() => setCallSpeaker(!callSpeaker)}
                  className={`w-14 h-14 rounded-full glass flex items-center justify-center touch-feedback transition-all ${callSpeaker ? "bg-vox-cyan/30" : ""}`}
                >
                  <Volume2 className={`w-6 h-6 ${callSpeaker ? "text-vox-cyan" : "text-white"}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ NEW MESSAGE MODAL ═══════ */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewMessage(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">New Message</h3>
                <button onClick={() => setShowNewMessage(false)} className="text-vox-muted touch-feedback hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input
                type="text"
                placeholder="Search people to message..."
                value={newMessageSearch}
                onChange={(e) => setNewMessageSearch(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-vox-purple"
              />
              <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-hide">
                {accounts
                  .filter(a => a.username !== currentUser?.username)
                  .filter(a => a.name.toLowerCase().includes(newMessageSearch.toLowerCase()) || a.username.toLowerCase().includes(newMessageSearch.toLowerCase()))
                  .map((account) => (
                  <button
                    key={account.username}
                    onClick={() => {
                      // Find or create chat for this user
                      const existing = chatsList.find(c => c.username === account.username);
                      if (existing) {
                        handleSelectChat(existing.id);
                      } else {
                        // Add new chat to list
                        const newChat: Chat = {
                          id: Date.now(),
                          name: account.name,
                          handle: `@${account.username}`,
                          username: account.username,
                          lastMessage: "Start a conversation",
                          time: "now",
                          unread: 0,
                          online: false,
                          verified: account.verified,
                          seller: account.isSeller,
                          avatar: "from-vox-purple to-vox-pink",
                          avatarUrl: account.avatar,
                          role: account.isSeller ? "Seller" : "",
                          followers: account.followers,
                          likes: "0",
                        };
                        setChatsList(prev => [newChat, ...prev]);
                        handleSelectChat(newChat.id);
                      }
                      setShowNewMessage(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl touch-feedback hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[2px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={account.avatar} alt={account.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{account.name}</p>
                      <p className="text-[11px] text-vox-muted">@{account.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BLOCK CONFIRM ═══════ */}
      <AnimatePresence>
        {showBlockConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBlockConfirm(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-sm space-y-4 text-center max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="w-14 h-14 rounded-full bg-vox-danger/20 flex items-center justify-center mx-auto">
                <Flag className="w-7 h-7 text-vox-danger" />
              </div>
              <h3 className="text-lg font-bold text-white">Block & Report?</h3>
              <p className="text-sm text-vox-muted">Are you sure you want to block and report {activeChat.name}? They won&apos;t be able to message you.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl glass touch-feedback text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowBlockConfirm(false); showToast(`${activeChat.name} blocked and reported`); }}
                  className="flex-1 py-2.5 rounded-xl bg-vox-danger touch-feedback text-sm font-semibold text-white hover:bg-vox-danger/80 transition-colors"
                >
                  Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ REPORT MODAL ═══════ */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="glass-strong rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center touch-feedback"
                >
                  <X className="w-4 h-4 text-vox-muted" />
                </button>
              </div>
              {["Spam", "Harassment", "Inappropriate content", "Scam", "Other"].map((r) => (
                <button
                  key={r}
                  onClick={() => setReportReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm touch-feedback mb-2 transition-colors ${
                    reportReason === r ? "btn-gradient text-white" : "glass text-vox-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={handleReportSubmit}
                className="w-full btn-gradient rounded-xl py-3 text-sm font-semibold text-white touch-feedback mt-2"
              >
                Submit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BLOCK MODAL ═══════ */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-white mb-2">Block User?</h3>
              <p className="text-sm text-vox-muted mb-6">
                They won&apos;t be able to message you or see your content.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="glass rounded-2xl py-3 text-sm font-semibold text-white touch-feedback"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockChat}
                  className="bg-vox-danger rounded-2xl py-3 text-sm font-semibold text-white touch-feedback"
                >
                  Block
                </button>
              </div>
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
            className="fixed bottom-24 lg:bottom-8 left-1/2 z-[90] glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for sending photos */}
      <input
        ref={msgPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleMsgPhotoSelect}
        className="hidden"
      />
    </div>
  );
}
