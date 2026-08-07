"use client";

/* ─────────────────────────────────────────────────────────────
   FIREBASE STORE - Hybrid service layer
   Uses Firebase Firestore + Storage when configured,
   falls back to localStorage + IndexedDB when not.
   ───────────────────────────────────────────────────────────── */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  getFileURL as idbGetFileURL,
  deleteFile as idbDeleteFile,
  compressImage,
  generateVideoThumbnail,
  timeAgo,
  formatCount,
  type Post,
  type Comment,
} from "./content-store";

export { compressImage, generateVideoThumbnail, timeAgo, formatCount };
export type { Post, Comment };

const USE_FIREBASE = isFirebaseConfigured();

/* ─────────────── POSTS ─────────────── */

/** Create a new post */
export async function createPost(data: {
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  caption: string;
  hashtags: string;
  type: "video" | "photo";
  mediaUrls: string[];
  mediaIds: string[];
  thumbnailUrl?: string;
  thumbnailId?: string;
  privacy: "Public" | "Friends" | "Private";
  allowDownload: boolean;
  allowComments: boolean;
  allowDuet: boolean;
}): Promise<Post> {
  const post: Omit<Post, "id"> = {
    authorUsername: data.authorUsername,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    caption: data.caption,
    hashtags: data.hashtags,
    type: data.type,
    mediaIds: data.mediaIds,
    thumbnailId: data.thumbnailId,
    privacy: data.privacy,
    allowDownload: data.allowDownload,
    allowComments: data.allowComments,
    allowDuet: data.allowDuet,
    createdAt: Date.now(),
    likes: 0,
    comments: [],
    saves: 0,
    shares: 0,
    views: 0,
    likedByMe: false,
    savedByMe: false,
  };

  if (USE_FIREBASE && db) {
    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      mediaUrls: data.mediaUrls,
      thumbnailUrl: data.thumbnailUrl || null,
      createdAt: serverTimestamp(),
    });
    return { ...post, id: docRef.id };
  }

  // Fallback to localStorage
  const posts = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const newPost: Post = { ...post, id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };
  posts.push(newPost);
  localStorage.setItem("voxel_posts", JSON.stringify(posts));
  return newPost;
}

/** Get all public posts for feed */
export function getFeedPosts(): Post[] {
  if (USE_FIREBASE && db) {
    // For Firebase, we use real-time listener instead
    return [];
  }
  const posts = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  return posts
    .filter((p: Post) => p.privacy === "Public")
    .sort((a: Post, b: Post) => b.createdAt - a.createdAt);
}

/** Get posts by username */
export function getUserPosts(username: string): Post[] {
  if (USE_FIREBASE && db) {
    return [];
  }
  const posts = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  return posts.filter((p: Post) => p.authorUsername === username);
}

/** Subscribe to feed posts (real-time) */
export function subscribeToFeedPosts(callback: (posts: Post[]) => void): Unsubscribe | (() => void) {
  if (USE_FIREBASE && db) {
    // No orderBy to avoid composite index requirement - sort client-side
    const q = query(
      collection(db, "posts"),
      where("privacy", "==", "Public"),
    );
    return onSnapshot(q, (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        posts.push({
          id: docSnap.id,
          authorUsername: data.authorUsername,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar,
          caption: data.caption,
          hashtags: data.hashtags || "",
          type: data.type,
          mediaIds: data.mediaIds || [],
          mediaUrls: data.mediaUrls || [],
          thumbnailUrl: data.thumbnailUrl || undefined,
          thumbnailId: data.thumbnailId,
          privacy: data.privacy,
          allowDownload: data.allowDownload ?? false,
          allowComments: data.allowComments ?? true,
          allowDuet: data.allowDuet ?? true,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          likes: data.likes || 0,
          comments: data.comments || [],
          saves: data.saves || 0,
          shares: data.shares || 0,
          views: data.views || 0,
          likedByMe: (data.likedBy || []).includes(getCurrentUserEmail()),
          savedByMe: (data.savedBy || []).includes(getCurrentUserEmail()),
        } as Post & { mediaUrls?: string[]; thumbnailUrl?: string });
      });
      // Sort client-side by createdAt descending
      posts.sort((a, b) => b.createdAt - a.createdAt);
      callback(posts);
    }, (error) => {
      console.error("Firestore feed subscription error:", error);
      callback([]);
    });
  }
  // Fallback: return posts from localStorage
  callback(getFeedPosts());
  return () => {};
}

/** Subscribe to user posts (real-time) */
export function subscribeToUserPosts(username: string, callback: (posts: Post[]) => void): Unsubscribe | (() => void) {
  if (USE_FIREBASE && db) {
    // No orderBy to avoid composite index requirement
    const q = query(
      collection(db, "posts"),
      where("authorUsername", "==", username),
    );
    return onSnapshot(q, (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        posts.push({
          id: docSnap.id,
          authorUsername: data.authorUsername,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar,
          caption: data.caption,
          hashtags: data.hashtags || "",
          type: data.type,
          mediaIds: data.mediaIds || [],
          mediaUrls: data.mediaUrls || [],
          thumbnailUrl: data.thumbnailUrl || undefined,
          thumbnailId: data.thumbnailId,
          privacy: data.privacy,
          allowDownload: data.allowDownload ?? false,
          allowComments: data.allowComments ?? true,
          allowDuet: data.allowDuet ?? true,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          likes: data.likes || 0,
          comments: data.comments || [],
          saves: data.saves || 0,
          shares: data.shares || 0,
          views: data.views || 0,
          likedByMe: (data.likedBy || []).includes(getCurrentUserEmail()),
          savedByMe: (data.savedBy || []).includes(getCurrentUserEmail()),
        } as Post & { mediaUrls?: string[]; thumbnailUrl?: string });
      });
      // Sort client-side by createdAt descending
      posts.sort((a, b) => b.createdAt - a.createdAt);
      callback(posts);
    }, (error) => {
      console.error("Firestore user posts subscription error:", error);
      callback([]);
    });
  }
  callback(getUserPosts(username));
  return () => {};
}

/** Toggle like on a post */
export async function toggleLike(postId: string): Promise<boolean> {
  const email = getCurrentUserEmail();
  if (USE_FIREBASE && db) {
    const post = await getPostById(postId);
    if (!post) return false;
    const likedBy = (post as Record<string, unknown>).likedBy as string[] || [];
    const isLiked = likedBy.includes(email);
    await updateDoc(doc(db, "posts", postId), {
      likedBy: isLiked ? arrayRemove(email) : arrayUnion(email),
      likes: increment(isLiked ? -1 : 1),
    });
    return !isLiked;
  }
  // Fallback
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const p = posts.find((x) => x.id === postId);
  if (!p) return false;
  p.likedByMe = !p.likedByMe;
  p.likes += p.likedByMe ? 1 : -1;
  if (p.likes < 0) p.likes = 0;
  localStorage.setItem("voxel_posts", JSON.stringify(posts));
  return p.likedByMe;
}

/** Toggle save on a post */
export async function toggleSave(postId: string): Promise<boolean> {
  const email = getCurrentUserEmail();
  if (USE_FIREBASE && db) {
    const post = await getPostById(postId);
    if (!post) return false;
    const savedBy = (post as Record<string, unknown>).savedBy as string[] || [];
    const isSaved = savedBy.includes(email);
    await updateDoc(doc(db, "posts", postId), {
      savedBy: isSaved ? arrayRemove(email) : arrayUnion(email),
      saves: increment(isSaved ? -1 : 1),
    });
    return !isSaved;
  }
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const p = posts.find((x) => x.id === postId);
  if (!p) return false;
  p.savedByMe = !p.savedByMe;
  p.saves += p.savedByMe ? 1 : -1;
  if (p.saves < 0) p.saves = 0;
  localStorage.setItem("voxel_posts", JSON.stringify(posts));
  return p.savedByMe;
}

/** Increment share count */
export async function incrementShare(postId: string): Promise<void> {
  if (USE_FIREBASE && db) {
    await updateDoc(doc(db, "posts", postId), { shares: increment(1) });
    return;
  }
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const p = posts.find((x) => x.id === postId);
  if (p) { p.shares += 1; localStorage.setItem("voxel_posts", JSON.stringify(posts)); }
}

/** Increment view count */
export async function incrementView(postId: string): Promise<void> {
  if (USE_FIREBASE && db) {
    await updateDoc(doc(db, "posts", postId), { views: increment(1) });
    return;
  }
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const p = posts.find((x) => x.id === postId);
  if (p) { p.views += 1; localStorage.setItem("voxel_posts", JSON.stringify(posts)); }
}

/** Add a comment */
export async function addComment(postId: string, data: {
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  text: string;
}): Promise<Comment> {
  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    authorUsername: data.authorUsername,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    text: data.text,
    createdAt: Date.now(),
    likes: 0,
  };

  if (USE_FIREBASE && db) {
    await updateDoc(doc(db, "posts", postId), {
      comments: arrayUnion(comment),
    });
    return comment;
  }
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  const p = posts.find((x) => x.id === postId);
  if (p) { p.comments.push(comment); localStorage.setItem("voxel_posts", JSON.stringify(posts)); }
  return comment;
}

/** Delete a post */
export async function deletePost(postId: string): Promise<void> {
  if (USE_FIREBASE && db) {
    await deleteDoc(doc(db, "posts", postId));
    return;
  }
  const posts: Post[] = JSON.parse(localStorage.getItem("voxel_posts") || "[]");
  localStorage.setItem("voxel_posts", JSON.stringify(posts.filter((p) => p.id !== postId)));
}

/** Get a single post by ID */
async function getPostById(postId: string): Promise<Record<string, unknown> | null> {
  if (!db) return null;
  const snapshot = await getDocs(query(collection(db, "posts"), where("__name__", "==", postId)));
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/* ─────────────── FILE STORAGE ─────────────── */

/** Convert a Blob to a base64 data URL */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Upload a file and return its URL (base64 data URL stored in Firestore) */
export async function uploadFile(file: Blob, path?: string): Promise<{ url: string; id: string }> {
  // Convert to base64 - works with Firestore without needing Storage
  const base64Url = await blobToBase64(file);
  const id = path || `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return { url: base64Url, id };
}

/** Get file URL - returns the base64 URL directly (stored in Firestore) */
export async function getFileURL(id: string): Promise<string | null> {
  // With base64 approach, URLs are stored directly in Firestore documents
  // This is only used for IndexedDB fallback
  return idbGetFileURL(id);
}

/** Delete a file */
export async function deleteFile(id: string): Promise<void> {
  // With base64 approach, files are stored in Firestore documents
  // Deleting the document removes the file data
  idbDeleteFile(id);
}

/** Download a file */
export async function downloadFile(mediaId: string, filename: string): Promise<void> {
  const url = await getFileURL(mediaId);
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ─────────────── MESSAGES ─────────────── */

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUsername: string;
  senderName: string;
  senderAvatar: string;
  receiverUsername: string;
  content: string;
  type: "text" | "image" | "gift";
  createdAt: number;
  read: boolean;
}

/** Send a message */
export async function sendMessage(data: {
  senderUsername: string;
  senderName: string;
  senderAvatar: string;
  receiverUsername: string;
  content: string;
  type?: "text" | "image" | "gift";
}): Promise<ChatMessage> {
  const chatId = getChatId(data.senderUsername, data.receiverUsername);
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    chatId,
    senderUsername: data.senderUsername,
    senderName: data.senderName,
    senderAvatar: data.senderAvatar,
    receiverUsername: data.receiverUsername,
    content: data.content,
    type: data.type || "text",
    createdAt: Date.now(),
    read: false,
  };

  if (USE_FIREBASE && db) {
    await addDoc(collection(db, "messages"), {
      ...message,
      createdAt: serverTimestamp(),
    });
    return message;
  }

  // Fallback to localStorage
  const messages: ChatMessage[] = JSON.parse(localStorage.getItem(`voxel_chat_${chatId}`) || "[]");
  messages.push(message);
  localStorage.setItem(`voxel_chat_${chatId}`, JSON.stringify(messages));
  return message;
}

/** Subscribe to messages between two users (real-time) */
export function subscribeToMessages(
  currentUser: string,
  otherUser: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe | (() => void) {
  const chatId = getChatId(currentUser, otherUser);

  if (USE_FIREBASE && db) {
    // Use only where clause (no orderBy) to avoid needing composite indexes
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
    );
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          chatId: data.chatId,
          senderUsername: data.senderUsername,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          receiverUsername: data.receiverUsername,
          content: data.content,
          type: data.type || "text",
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          read: data.read || false,
        });
      });
      // Sort client-side by createdAt
      messages.sort((a, b) => a.createdAt - b.createdAt);
      callback(messages);
    }, (error) => {
      console.error("Firestore messages subscription error:", error);
      callback([]);
    });
  }

  // Fallback
  const messages: ChatMessage[] = JSON.parse(localStorage.getItem(`voxel_chat_${chatId}`) || "[]");
  callback(messages);
  return () => {};
}

/** Subscribe to all conversations for a user (real-time) */
export function subscribeToConversations(
  username: string,
  callback: (conversations: { username: string; lastMessage: string; lastMessageTime: number; unread: number }[]) => void,
): Unsubscribe | (() => void) {
  if (USE_FIREBASE && db) {
    // Query messages where the user is either sender or receiver
    const qSender = query(collection(db, "messages"), where("senderUsername", "==", username));
    const qReceiver = query(collection(db, "messages"), where("receiverUsername", "==", username));

    let senderResults: ChatMessage[] = [];
    let receiverResults: ChatMessage[] = [];

    const updateConversations = () => {
      const allMessages = [...senderResults, ...receiverResults];
      // Group by the other user
      const convos = new Map<string, { lastMessage: string; lastMessageTime: number; unread: number }>();
      for (const msg of allMessages) {
        const otherUser = msg.senderUsername === username ? msg.receiverUsername : msg.senderUsername;
        const existing = convos.get(otherUser);
        if (!existing || msg.createdAt > existing.lastMessageTime) {
          convos.set(otherUser, {
            lastMessage: msg.type === "image" ? "📷 Photo" : msg.content,
            lastMessageTime: msg.createdAt,
            unread: msg.receiverUsername === username && !msg.read ? (existing?.unread || 0) + 1 : (existing?.unread || 0),
          });
        } else if (msg.receiverUsername === username && !msg.read) {
          existing.unread++;
        }
      }
      const result = Array.from(convos.entries()).map(([u, data]) => ({
        username: u,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime,
        unread: data.unread,
      }));
      result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      callback(result);
    };

    const unsub1 = onSnapshot(qSender, (snapshot) => {
      senderResults = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        senderResults.push({
          id: docSnap.id,
          chatId: data.chatId,
          senderUsername: data.senderUsername,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          receiverUsername: data.receiverUsername,
          content: data.content,
          type: data.type || "text",
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          read: data.read || false,
        });
      });
      updateConversations();
    }, (error) => {
      console.error("Firestore conversations (sender) error:", error);
    });

    const unsub2 = onSnapshot(qReceiver, (snapshot) => {
      receiverResults = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        receiverResults.push({
          id: docSnap.id,
          chatId: data.chatId,
          senderUsername: data.senderUsername,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          receiverUsername: data.receiverUsername,
          content: data.content,
          type: data.type || "text",
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          read: data.read || false,
        });
      });
      updateConversations();
    }, (error) => {
      console.error("Firestore conversations (receiver) error:", error);
    });

    return () => { unsub1(); unsub2(); };
  }

  // Fallback: no conversations in localStorage mode
  callback([]);
  return () => {};
}

/** Get chat ID (consistent regardless of who's sender/receiver) */
function getChatId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

/* ─────────────── HELPERS ─────────────── */

function getCurrentUserEmail(): string {
  try {
    const session = JSON.parse(localStorage.getItem("voxel_session") || "null");
    return session?.email || "anonymous";
  } catch {
    return "anonymous";
  }
}
