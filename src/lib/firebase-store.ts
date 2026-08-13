"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ─────────────────────────────────────────────────────────────
   FIREBASE STORE - Hybrid service layer
   Uses Firebase Firestore + Storage when configured,
   falls back to localStorage + IndexedDB when not.
   ───────────────────────────────────────────────────────────── */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured, ensureAuth, auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import {
  getFileURL as idbGetFileURL,
  deleteFile as idbDeleteFile,
  compressImage,
  compressImageForFirestore,
  generateVideoThumbnail,
  timeAgo,
  formatCount,
  type Post,
  type Comment,
  type LiveStream,
  getActiveStreams as localGetActiveStreams,
  startLiveStream as localStartLiveStream,
  endLiveStream as localEndLiveStream,
  incrementStreamViewers as localIncrementStreamViewers,
  getStreamById as localGetStreamById,
  incrementView as localIncrementView,
} from "./content-store";

export { compressImage, compressImageForFirestore, generateVideoThumbnail, timeAgo, formatCount };
export type { Post, Comment, LiveStream };

const USE_FIREBASE = isFirebaseConfigured();
const USE_STORAGE = isFirebaseConfigured() && storage;

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
  likes?: number;
  views?: number;
  shares?: number;
  saves?: number;
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
    likes: data.likes ?? 0,
    comments: [],
    saves: data.saves ?? 0,
    shares: data.shares ?? 0,
    views: data.views ?? 0,
    likedByMe: false,
    savedByMe: false,
  };

  if (USE_FIREBASE && db) {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        ...post,
        mediaUrls: data.mediaUrls,
        thumbnailId: data.thumbnailId || null,
        thumbnailUrl: data.thumbnailUrl || null,
        createdAt: serverTimestamp(),
      });
      return { ...post, id: docRef.id };
    } catch (err) {
      console.warn("Firebase write failed, falling back to localStorage:", err);
    }
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
      // Merge with localStorage posts (in case some were saved locally after Firebase failures)
      const localPosts = getFeedPosts();
      const localIds = new Set(localPosts.map((p) => p.id));
      const merged = [...posts.filter((p) => !localIds.has(p.id)), ...localPosts];
      // Sort client-side by createdAt descending
      merged.sort((a, b) => b.createdAt - a.createdAt);
      callback(merged);
    }, (error) => {
      console.error("Firestore feed subscription error:", error);
      callback(getFeedPosts());
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
      // Merge with localStorage posts (in case some were saved locally after Firebase failures)
      const localPosts = getUserPosts(username);
      const localIds = new Set(localPosts.map((p) => p.id));
      const merged = [...posts.filter((p) => !localIds.has(p.id)), ...localPosts];
      // Sort client-side by createdAt descending
      merged.sort((a, b) => b.createdAt - a.createdAt);
      callback(merged);
    }, (error) => {
      console.error("Firestore user posts subscription error:", error);
      callback(getUserPosts(username));
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

/** Increment view count (only once per viewer). */
export async function incrementView(postId: string, viewerId?: string): Promise<void> {
  if (USE_FIREBASE && db) {
    const postRef = doc(db, "posts", postId);
    if (viewerId) {
      // Read current doc and only increment if this viewer has not already viewed
      const snap = await getDoc(postRef);
      const data = snap.data() as Record<string, any>;
      const viewedBy: string[] = data?.viewedBy || [];
      if (!viewedBy.includes(viewerId)) {
        await updateDoc(postRef, {
          views: increment(1),
          viewedBy: arrayUnion(viewerId),
        });
      }
    } else {
      await updateDoc(postRef, { views: increment(1) });
    }
    return;
  }
  localIncrementView(postId, viewerId);
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

/** Upload a file to Firebase Storage and return its download URL */
export async function uploadFileToStorage(file: Blob, path?: string): Promise<{ url: string; id: string }> {
  if (!USE_STORAGE || !storage) {
    throw new Error("Firebase Storage not configured");
  }

  // Ensure we have an anonymous auth session for Storage rules
  await ensureAuth();

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  let ext = "";

  if (file.type.startsWith("image/")) {
    if (file.type.includes("jpeg") || file.type.includes("jpg")) ext = ".jpg";
    else if (file.type.includes("png")) ext = ".png";
    else if (file.type.includes("webp")) ext = ".webp";
    else ext = ".jpg";
  } else if (file.type.startsWith("video/")) {
    if (file.type.includes("mov") || file.type.includes("quicktime")) ext = ".mov";
    else if (file.type.includes("mp4")) ext = ".mp4";
    else ext = ".mp4";
  } else if (file.type.startsWith("audio/")) {
    if (file.type.includes("mp3")) ext = ".mp3";
    else if (file.type.includes("m4a") || file.type.includes("mp4")) ext = ".m4a";
    else ext = ".mp3";
  }

  const storagePath = path || `uploads/${timestamp}_${random}${ext}`;
  const storageRef = ref(storage!, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, id: storagePath };
}

/** Get a Firebase Storage download URL by path/id */
export async function getStorageFileURL(id: string): Promise<string | null> {
  if (!storage) return null;
  try {
    return await getDownloadURL(ref(storage!, id));
  } catch {
    return null;
  }
}

/** Delete a Firebase Storage object by path/id */
export async function deleteStorageFile(id: string): Promise<void> {
  if (!storage) return;
  await deleteObject(ref(storage!, id));
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

/** Mark all messages in a conversation as read */
export async function markMessagesAsRead(
  currentUser: string,
  otherUser: string,
): Promise<void> {
  const chatId = getChatId(currentUser, otherUser);
  if (USE_FIREBASE && db) {
    const dbInstance = db; // Capture for type narrowing in closure
    const q = query(
      collection(dbInstance, "messages"),
      where("chatId", "==", chatId),
      where("receiverUsername", "==", currentUser),
      where("read", "==", false),
    );
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map((docSnap) =>
      updateDoc(doc(dbInstance, "messages", docSnap.id), { read: true }),
    );
    await Promise.all(batch);
    return;
  }
  // Fallback: update localStorage
  const messages: ChatMessage[] = JSON.parse(localStorage.getItem(`voxel_chat_${chatId}`) || "[]");
  messages.forEach((m) => {
    if (m.receiverUsername === currentUser) m.read = true;
  });
  localStorage.setItem(`voxel_chat_${chatId}`, JSON.stringify(messages));
}

/** Set typing status for a user in a conversation */
export async function setTypingStatus(
  currentUser: string,
  otherUser: string,
  isTyping: boolean,
): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  const chatId = getChatId(currentUser, otherUser);
  const typingId = `typing_${chatId}_${currentUser}`;
  try {
    if (isTyping) {
      await addDoc(collection(db, "typing"), {
        id: typingId,
        chatId,
        username: currentUser,
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    }
  } catch {
    // Ignore typing errors - non-critical feature
  }
}

/** Subscribe to typing status of the other user */
export function subscribeToTyping(
  currentUser: string,
  otherUser: string,
  callback: (isTyping: boolean) => void,
): Unsubscribe | (() => void) {
  if (!USE_FIREBASE || !db) {
    callback(false);
    return () => {};
  }
  const chatId = getChatId(currentUser, otherUser);
  const q = query(
    collection(db, "typing"),
    where("chatId", "==", chatId),
    where("username", "==", otherUser),
  );
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(false);
      return;
    }
    // Check if the typing indicator is recent (within 3 seconds)
    const latest = snapshot.docs[snapshot.docs.length - 1].data();
    const timestamp = latest.timestamp?.toMillis?.() || 0;
    const isRecent = Date.now() - timestamp < 3000;
    callback(isRecent && latest.isTyping);
  }, () => {
    callback(false);
  });
}

/** Get total unread message count for a user */
export function subscribeToUnreadCount(
  username: string,
  callback: (count: number) => void,
): Unsubscribe | (() => void) {
  if (USE_FIREBASE && db) {
    const q = query(
      collection(db, "messages"),
      where("receiverUsername", "==", username),
      where("read", "==", false),
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    }, () => {
      callback(0);
    });
  }
  callback(0);
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

  // Fallback: scan localStorage for all chat partners
  const chatPartners = new Set<string>();
  // Scan all voxel_chat_* keys to find conversations
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("voxel_chat_")) {
      const chatId = key.replace("voxel_chat_", "");
      const parts = chatId.split("_");
      if (parts.length >= 2) {
        // chatId is sorted usernames joined by _
        const users = chatId.split("_");
        for (const u of users) {
          if (u !== username) chatPartners.add(u);
        }
      }
    }
  }
  const result: { username: string; lastMessage: string; lastMessageTime: number; unread: number }[] = [];
  for (const partner of Array.from(chatPartners)) {
    const chatId = getChatId(username, partner);
    const msgs: ChatMessage[] = JSON.parse(localStorage.getItem(`voxel_chat_${chatId}`) || "[]");
    if (msgs.length === 0) continue;
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter(m => m.receiverUsername === username && !m.read).length;
    result.push({
      username: partner,
      lastMessage: lastMsg.type === "image" ? "📷 Photo" : lastMsg.content,
      lastMessageTime: lastMsg.createdAt,
      unread,
    });
  }
  result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  callback(result);
  return () => {};
}

/** Get chat ID (consistent regardless of who's sender/receiver) */
function getChatId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

/* ─────────────── LIVE STREAMS ─────────────── */

/** Start a new live stream (real-time, shared across all users) */
export async function startLiveStream(data: {
  hostUsername: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: string;
}): Promise<LiveStream> {
  if (USE_FIREBASE && db) {
    try {
      const stream: LiveStream = {
        id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        hostUsername: data.hostUsername,
        hostName: data.hostName,
        hostAvatar: data.hostAvatar,
        title: data.title,
        category: data.category,
        startedAt: Date.now(),
        viewers: 1,
        active: true,
      };
      const docRef = await addDoc(collection(db, "liveStreams"), {
        ...stream,
        createdAt: serverTimestamp(),
      });
      // Return with Firestore doc id as canonical id
      return { ...stream, id: docRef.id };
    } catch (err) {
      console.error("Firestore startLiveStream failed, using localStorage:", err);
    }
  }
  return localStartLiveStream(data);
}

/** End a live stream by id */
export async function endLiveStream(streamId: string): Promise<void> {
  if (USE_FIREBASE && db) {
    try {
      await updateDoc(doc(db, "liveStreams", streamId), { active: false, endedAt: serverTimestamp() });
      return;
    } catch (err) {
      console.error("Firestore endLiveStream failed, using localStorage:", err);
    }
  }
  return localEndLiveStream(streamId);
}

/** Subscribe to active live streams in real time */
export function subscribeToActiveStreams(
  callback: (streams: LiveStream[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe | (() => void) {
  if (USE_FIREBASE && db) {
    try {
      // Single where clause to avoid composite index requirement.
      // Filter the 4-hour cutoff client-side.
      const cutoff = Date.now() - 4 * 60 * 60 * 1000;
      const q = query(
        collection(db, "liveStreams"),
        where("active", "==", true),
      );
      return onSnapshot(q, (snapshot) => {
        const streams: LiveStream[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          const startedAt = data.startedAt?.toMillis?.() || data.startedAt || 0;
          if (startedAt > cutoff) {
            streams.push({
              id: docSnap.id,
              hostUsername: data.hostUsername,
              hostName: data.hostName,
              hostAvatar: data.hostAvatar,
              title: data.title,
              category: data.category,
              startedAt,
              viewers: data.viewers || 0,
              active: data.active ?? true,
            });
          }
        });
        // Sort by viewers desc
        callback(streams.sort((a, b) => b.viewers - a.viewers));
      }, (error) => {
        console.error("Firestore live streams subscription error:", error);
        if (onError) onError(error as Error);
      });
    } catch (err) {
      console.error("Firestore live streams setup failed:", err);
    }
  }

  // Fallback: localStorage
  const update = () => {
    callback(localGetActiveStreams());
  };
  update();
  const interval = setInterval(update, 3000);
  return () => clearInterval(interval);
}

/** Increment or decrement viewer count for a stream */
export async function incrementStreamViewers(streamId: string, delta: number): Promise<void> {
  if (USE_FIREBASE && db) {
    try {
      const streamRef = doc(db, "liveStreams", streamId);
      await updateDoc(streamRef, { viewers: increment(delta) });
      return;
    } catch (err) {
      console.error("Firestore incrementStreamViewers failed:", err);
    }
  }
  return localIncrementStreamViewers(streamId, delta);
}

/** Get a single stream by id */
export async function getStreamById(streamId: string): Promise<LiveStream | null> {
  if (USE_FIREBASE && db) {
    try {
      const dbInstance = db;
      const streamDoc = await getDoc(doc(dbInstance, "liveStreams", streamId));
      if (streamDoc.exists()) {
        const data = streamDoc.data();
        return {
          id: streamDoc.id,
          hostUsername: data.hostUsername,
          hostName: data.hostName,
          hostAvatar: data.hostAvatar,
          title: data.title,
          category: data.category,
          startedAt: data.startedAt?.toMillis?.() || data.startedAt || 0,
          viewers: data.viewers || 0,
          active: data.active ?? true,
        };
      }
      return null;
    } catch (err) {
      console.error("Firestore getStreamById failed:", err);
    }
  }
  return localGetStreamById(streamId);
}

/* ─────────────── USERS / ACCOUNTS ─────────────── */

export interface UserProfile {
  uid: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  cover: string;
  followers: number;
  following: number;
  posts_count: number;
  verified: boolean;
  category: string;
  country: string;
  flag: string;
  isPrivate: boolean;
  isSeller: boolean;
  createdAt: number;
  updatedAt: number;
}

function accountToProfile(uid: string, data: Record<string, any>): UserProfile {
  return {
    uid,
    username: (data.username as string) || "",
    name: (data.name as string) || "",
    email: (data.email as string) || "",
    bio: (data.bio as string) || "",
    avatar: (data.avatar as string) || "",
    cover: (data.cover as string) || "",
    followers: (data.followers as number) ?? 0,
    following: (data.following as number) ?? 0,
    posts_count: (data.posts_count as number) ?? 0,
    verified: (data.verified as boolean) ?? false,
    category: (data.category as string) || "",
    country: (data.country as string) || "",
    flag: (data.flag as string) || "",
    isPrivate: (data.isPrivate as boolean) ?? false,
    isSeller: (data.isSeller as boolean) ?? false,
    createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || 0,
  };
}

export async function createUserAccount(data: {
  username: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
  category?: string;
  country?: string;
  flag?: string;
}): Promise<{ user: UserProfile; credential: UserCredential } | { error: string }> {
  if (!USE_FIREBASE || !auth || !db) {
    return { error: "Firebase not configured" };
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const now = Date.now();
    const profile: Omit<UserProfile, "uid"> & { uid?: string } = {
      username: data.username.trim(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      bio: data.bio?.trim() || "",
      avatar:
        data.avatar?.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name.trim())}&background=6C2BD9&color=fff&size=200&bold=true`,
      cover: "",
      followers: 0,
      following: 0,
      posts_count: 0,
      verified: false,
      category: data.category?.trim() || "",
      country: data.country?.trim() || "",
      flag: data.flag?.trim() || "",
      isPrivate: false,
      isSeller: false,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", credential.user.uid), {
      ...profile,
      uid: credential.user.uid,
    });
    return { user: { ...profile, uid: credential.user.uid }, credential };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("auth/email-already-in-use")) return { error: "An account with this email already exists." };
    if (message.includes("auth/weak-password")) return { error: "Password is too weak." };
    console.error("Firebase create user error:", err);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginUserAccount(email: string, password: string): Promise<{ user: UserProfile; credential: UserCredential } | { error: string }> {
  if (!USE_FIREBASE || !auth || !db) {
    return { error: "Firebase not configured" };
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", credential.user.uid));
    if (userDoc.exists()) {
      return { user: accountToProfile(credential.user.uid, userDoc.data() as Record<string, any>), credential };
    }
    // Auth exists but no profile yet — create a minimal one
    const now = Date.now();
    const fallback: UserProfile = {
      uid: credential.user.uid,
      username: credential.user.email?.split("@")[0] || "user",
      name: credential.user.displayName || "User",
      email: credential.user.email || email,
      bio: "",
      avatar: credential.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent("User")}&background=6C2BD9&color=fff&size=200&bold=true`,
      cover: "",
      followers: 0,
      following: 0,
      posts_count: 0,
      verified: false,
      category: "",
      country: "",
      flag: "",
      isPrivate: false,
      isSeller: false,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", credential.user.uid), fallback);
    return { user: fallback, credential };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password") || message.includes("auth/user-not-found")) {
      return { error: "Invalid email or password." };
    }
    console.error("Firebase login error:", err);
    return { error: "Login failed. Please try again." };
  }
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  if (!USE_FIREBASE || !db) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) return accountToProfile(uid, userDoc.data() as Record<string, any>);
    return null;
  } catch (err) {
    console.error("Firebase load user profile error:", err);
    return null;
  }
}

/** Look up a user profile by username (cross-device) */
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  if (!USE_FIREBASE || !db) return null;
  try {
    const q = query(collection(db, "users"), where("username", "==", username.trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return accountToProfile(docSnap.id, docSnap.data() as Record<string, any>);
  } catch (err) {
    console.error("Firebase getUserByUsername error:", err);
    return null;
  }
}

/** Search user profiles by username or name prefix */
export async function searchUsers(term: string): Promise<UserProfile[]> {
  if (!USE_FIREBASE || !db || !term.trim()) return [];
  try {
    const lower = term.toLowerCase().trim();
    const q = query(collection(db, "users"), where("username", ">=", lower), where("username", "<=", lower + "\uf8ff"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => accountToProfile(d.id, d.data() as Record<string, any>));
  } catch (err) {
    console.error("Firebase searchUsers error:", err);
    return [];
  }
}

export async function updateUserProfile(uid: string, updates: Partial<Omit<UserProfile, "uid" | "email" | "createdAt">>): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Firebase update user profile error:", err);
  }
}

/* ─────────────── FOLLOWS (cross-device) ─────────────── */

/** Toggle follow status in Firestore. Returns the new followed state. */
export async function toggleFollow(currentUsername: string, targetUsername: string): Promise<boolean> {
  if (!USE_FIREBASE || !db) return false;
  try {
    const followId = `${currentUsername.trim()}_${targetUsername.trim()}`;
    const followRef = doc(db, "follows", followId);
    const snap = await getDoc(followRef);
    if (snap.exists()) {
      await deleteDoc(followRef);
      return false;
    }
    await setDoc(followRef, {
      follower: currentUsername.trim(),
      following: targetUsername.trim(),
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Firebase toggleFollow error:", err);
    return false;
  }
}

/** Check if current user follows target in Firestore. */
export async function isFollowing(currentUsername: string, targetUsername: string): Promise<boolean> {
  if (!USE_FIREBASE || !db) return false;
  try {
    const followId = `${currentUsername.trim()}_${targetUsername.trim()}`;
    const snap = await getDoc(doc(db, "follows", followId));
    return snap.exists();
  } catch (err) {
    console.error("Firebase isFollowing error:", err);
    return false;
  }
}

/** Get the list of usernames a user is following. */
export async function getFollowing(currentUsername: string): Promise<string[]> {
  if (!USE_FIREBASE || !db) return [];
  try {
    const q = query(collection(db, "follows"), where("follower", "==", currentUsername.trim()));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().following as string);
  } catch (err) {
    console.error("Firebase getFollowing error:", err);
    return [];
  }
}

/** Get the list of usernames following a target user. */
export async function getFollowers(targetUsername: string): Promise<string[]> {
  if (!USE_FIREBASE || !db) return [];
  try {
    const q = query(collection(db, "follows"), where("following", "==", targetUsername.trim()));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().follower as string);
  } catch (err) {
    console.error("Firebase getFollowers error:", err);
    return [];
  }
}

/* ─────────────── NOTIFICATIONS (cross-device) ─────────────── */

export interface VoxNotification {
  id?: string;
  type: "follow" | "like" | "comment" | "live" | "message" | "gift" | "purchase" | "mention" | "system";
  fromUsername: string;
  fromName: string;
  fromAvatar: string;
  toUsername: string;
  message: string;
  detail?: string;
  postId?: string;
  read: boolean;
  createdAt: number;
}

/** Add a notification document to Firestore. */
export async function addNotification(toUsername: string, data: Omit<VoxNotification, "id" | "toUsername" | "read" | "createdAt">): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  try {
    await addDoc(collection(db, "notifications"), {
      ...data,
      toUsername,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Firebase addNotification error:", err);
  }
}

/** Subscribe to a user's unread notifications. */
export function subscribeToNotifications(
  username: string,
  callback: (notifications: VoxNotification[]) => void,
): Unsubscribe | (() => void) {
  if (!USE_FIREBASE || !db) return () => {};
  try {
    const q = query(collection(db, "notifications"), where("toUsername", "==", username.trim()));
    return onSnapshot(q, (snapshot) => {
      const notifications: VoxNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        if (data.read === false) {
          notifications.push({
            id: docSnap.id,
            type: data.type,
            fromUsername: data.fromUsername,
            fromName: data.fromName,
            fromAvatar: data.fromAvatar,
            toUsername: data.toUsername,
            message: data.message,
            detail: data.detail,
            read: data.read,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
          });
        }
      });
      callback(notifications.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firebase subscribeToNotifications error:", error);
    });
  } catch (err) {
    console.error("Firebase subscribeToNotifications setup error:", err);
    return () => {};
  }
}

/** Mark a notification as read. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  } catch (err) {
    console.error("Firebase markNotificationRead error:", err);
  }
}

/** Mark all of a user's notifications as read. */
export async function markAllNotificationsRead(username: string): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  try {
    const q = query(collection(db, "notifications"), where("toUsername", "==", username.trim()));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.forEach((d) => {
      const data = d.data();
      if (data.read === false) batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Firebase markAllNotificationsRead error:", err);
  }
}

/** Delete all of a user's notifications. */
export async function clearNotifications(username: string): Promise<void> {
  if (!USE_FIREBASE || !db) return;
  try {
    const q = query(collection(db, "notifications"), where("toUsername", "==", username.trim()));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.error("Firebase clearNotifications error:", err);
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
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
