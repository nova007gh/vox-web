"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Video,
  Upload,
  Wand2,
  Captions,
  Layers,
  ShieldCheck,
  Copyright,
  AlertTriangle,
  UserCheck,
  Clock,
  ToggleLeft,
  ToggleRight,
  Zap,
  X,
  Check,
  Send,
  Lock,
  Globe,
  Users,
  Image as ImageIcon,
  Loader2,
  ShoppingBag,
  DollarSign,
  Tag,
  Radio,
  Search,
  Heart,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  uploadFile,
  createPost as fbCreatePost,
  generateVideoThumbnail,
  compressImageForFirestore,
} from "@/lib/firebase-store";
import { uploadToCloudinary } from "@/lib/cloudinary";

/* ─────────────────────────── DATA ─────────────────────────── */

const tools = [
  { label: "Record", icon: "🎬", desc: "Record video", gradient: "from-red-500/20 to-orange-500/20", action: "record" },
  { label: "Upload", icon: "📤", desc: "Upload media", gradient: "from-blue-500/20 to-cyan-500/20", action: "upload" },
  { label: "AI Edit", icon: "🤖", desc: "Auto-enhance", gradient: "from-purple-500/20 to-pink-500/20", action: "ai-edit" },
  { label: "Add Music", icon: "🎵", desc: "Audio tracks", gradient: "from-pink-500/20 to-rose-500/20", action: "music" },
  { label: "Trim & Split", icon: "✂️", desc: "Cut & arrange", gradient: "from-orange-500/20 to-amber-500/20", action: "trim" },
  { label: "Captions", icon: "💬", desc: "Auto-subtitle", gradient: "from-cyan-500/20 to-blue-500/20", action: "captions" },
  { label: "Effects", icon: "✨", desc: "Filters & FX", gradient: "from-fuchsia-500/20 to-purple-500/20", action: "effects" },
  { label: "Background", icon: "🎨", desc: "Virtual BG", gradient: "from-green-500/20 to-teal-500/20", action: "background" },
  { label: "Voiceover", icon: "🎙️", desc: "Record audio", gradient: "from-amber-500/20 to-yellow-500/20", action: "voiceover" },
  { label: "Remix", icon: "🔄", desc: "Remix content", gradient: "from-indigo-500/20 to-violet-500/20", action: "remix" },
  { label: "Duet", icon: "👥", desc: "Side by side", gradient: "from-rose-500/20 to-pink-500/20", action: "/" },
  { label: "Stitch", icon: "🧵", desc: "Stitch clips", gradient: "from-teal-500/20 to-emerald-500/20", action: "/" },
  { label: "Go Live", icon: "📡", desc: "Start stream", gradient: "from-red-500/20 to-rose-500/20", action: "/live" },
  { label: "Live Auction", icon: "🔨", desc: "Host auction", gradient: "from-yellow-500/20 to-orange-500/20", action: "/marketplace" },
  { label: "Photo", icon: "📸", desc: "Take photo", gradient: "from-sky-500/20 to-blue-500/20", action: "photo" },
  { label: "Drafts", icon: "📝", desc: "Saved drafts", gradient: "from-gray-500/20 to-slate-500/20", action: "drafts" },
];

const aiChecks = [
  { label: "Quality Check", desc: "Resolution, lighting, audio clarity", icon: ShieldCheck, color: "text-vox-green" },
  { label: "Copyright Scan", desc: "Detect copyrighted audio & visuals", icon: Copyright, color: "text-vox-cyan" },
  { label: "Scam Detection", desc: "Flag misleading claims & links", icon: AlertTriangle, color: "text-vox-warning" },
  { label: "Impersonation", desc: "Verify identity & originality", icon: UserCheck, color: "text-vox-purple" },
  { label: "Auto Captions", desc: "Generate subtitles in 40+ languages", icon: Captions, color: "text-vox-pink" },
  { label: "Best Time", desc: "AI-recommended posting schedule", icon: Clock, color: "text-vox-orange" },
];

const contentControls = [
  { label: "Save Audio", desc: "Let others use your original sound", default: true },
  { label: "Allow Repost", desc: "Enable resharing by followers", default: true },
  { label: "Allow Download", desc: "Let viewers download this video", default: false },
  { label: "Allow Duet", desc: "Let creators duet with this video", default: true },
  { label: "Allow Stitch", desc: "Let creators stitch your content", default: true },
  { label: "Allow Remix", desc: "Enable creative remixes", default: false },
];

const privacyOptions = [
  { label: "Public", icon: Globe, desc: "Anyone can view" },
  { label: "Friends", icon: Users, desc: "Only your followers" },
  { label: "Private", icon: Lock, desc: "Only you" },
];

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function CreatePage() {
  const router = useRouter();
  const { currentUser, hydrated } = useAuth();
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(contentControls.map((c) => [c.label, c.default]))
  );
  const [aiChecked, setAiChecked] = useState<Set<string>>(new Set());
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordCameraReady, setRecordCameraReady] = useState(false);
  const [recordFacingMode, setRecordFacingMode] = useState<"user" | "environment">("user");
  const [showRecordEffects, setShowRecordEffects] = useState(false);
  const flipInProgressRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordVideoRef = useRef<HTMLVideoElement | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  // Ad posting state
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adPrice, setAdPrice] = useState("");
  const [adCategory, setAdCategory] = useState("Beauty");
  const [adImageId, setAdImageId] = useState<string | null>(null);
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [adPublishing, setAdPublishing] = useState(false);
  const adFileInputRef = useRef<HTMLInputElement>(null);

  // Creator tool states
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [musicPlaying, setMusicPlaying] = useState<string | null>(null);
  const [musicSearch, setMusicSearch] = useState("");
  const [musicFavTab, setMusicFavTab] = useState<"all" | "favorites" | "trending">("all");
  const [musicFavorites, setMusicFavorites] = useState<string[]>([]);
  const [musicDuration, setMusicDuration] = useState(30); // user-selectable clip length (seconds)
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [aiEnhancements, setAiEnhancements] = useState<string[]>([]);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [isVoiceoverRecording, setIsVoiceoverRecording] = useState(false);
  const [voiceoverTime, setVoiceoverTime] = useState(0);
  const [drafts, setDrafts] = useState<{ id: string; title: string; data: Record<string, unknown>; createdAt: number }[]>([]);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceoverRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceoverChunksRef = useRef<Blob[]>([]);
  const voiceoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Real upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [hydrated, currentUser, router]);

  // Load drafts on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("voxel_create_drafts");
        if (saved) {
          const parsed = JSON.parse(saved);
          setDrafts(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Load music favorites on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("voxel_music_favorites");
        if (saved) {
          const parsed = JSON.parse(saved);
          setMusicFavorites(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const toggleMusicFavorite = (trackName: string) => {
    setMusicFavorites((prev) => {
      const next = prev.includes(trackName)
        ? prev.filter((t) => t !== trackName)
        : [...prev, trackName];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("voxel_music_favorites", JSON.stringify(next));
      }
      return next;
    });
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError(null);

    // Validate file types and sizes
    const valid = files.filter((f) => {
      const isVideo = f.type.startsWith("video/");
      const isImage = f.type.startsWith("image/");
      const sizeOk = f.size <= 500 * 1024 * 1024; // 500MB
      if (!isVideo && !isImage) {
        setUploadError("Only video and image files are supported");
        return false;
      }
      if (!sizeOk) {
        setUploadError("Files must be under 500MB");
        return false;
      }
      return true;
    });

    if (valid.length === 0) return;

    setSelectedFiles(valid);
    const urls = valid.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setShowPublish(true);
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (label: string) => {
    setToggleStates((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleAiCheck = (label: string) => {
    setAiChecked((prev) => {
      const s = new Set(prev);
      if (s.has(label)) s.delete(label);
      else s.add(label);
      return s;
    });
  };

  // Recording effect: manages camera, MediaRecorder, timer, and finalization
  useEffect(() => {
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: recordFacingMode },
          audio: true,
        });
        recordStreamRef.current = stream;
        if (recordVideoRef.current) {
          recordVideoRef.current.srcObject = stream;
          recordVideoRef.current.play().catch(() => {});
        }
        setRecordCameraReady(true);

        recordChunksRef.current = [];
        recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          if (flipInProgressRef.current) {
            flipInProgressRef.current = false;
            return;
          }
          if (recordChunksRef.current.length === 0) return;
          const blob = new Blob(recordChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const file = new File([blob], `recorded_${Date.now()}.webm`, { type: mimeType });
          setSelectedFiles([file]);
          setPreviewUrls([url]);
          setShowPublish(true);
          setIsRecording(false);
          setRecordTime(0);
          setRecordCameraReady(false);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(100);

        setRecordTime(0);
        timer = setInterval(() => setRecordTime((t) => t + 1), 1000);
      } catch (err) {
        console.error("Failed to start recording:", err);
        setUploadError("Camera/microphone access denied. Please allow permissions to record.");
        setIsRecording(false);
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordVideoRef.current) recordVideoRef.current.srcObject = null;
      recordStreamRef.current = null;
      setRecordCameraReady(false);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (recordStreamRef.current === stream) recordStreamRef.current = null;
      }
    };
  }, [isRecording, recordFacingMode]);

  const handleFlipRecordCamera = () => {
    flipInProgressRef.current = true;
    setRecordCameraReady(false);
    setRecordFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.action.startsWith("/")) {
      router.push(tool.action);
    } else if (tool.action === "record") {
      setIsRecording(true);
    } else {
      setActivePanel(tool.action);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handlePublish = async () => {
    if (!currentUser) {
      setUploadError("Please log in to publish");
      return;
    }
    if (selectedFiles.length === 0 && !isRecording) {
      setUploadError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const mediaIds: string[] = [];
      const mediaUrls: string[] = [];
      let thumbnailId: string | undefined;
      let thumbnailUrl: string | undefined;
      const isVideo = selectedFiles.length > 0 && selectedFiles[0].type.startsWith("video/");
      const { storeFile } = await import("@/lib/content-store");

      for (const file of selectedFiles) {
        if (file.type.startsWith("image/")) {
          // Store full image in IndexedDB (no size limit)
          const imageId = await storeFile(file);
          mediaIds.push(imageId);
          // Create a small thumbnail for feed display (fits in Firestore/localStorage)
          const thumb = await compressImageForFirestore(file, 150000);
          const { url: thumbUrl } = await uploadFile(thumb);
          mediaUrls.push(thumbUrl);
        } else if (file.type.startsWith("video/")) {
          // For videos: store thumbnail (small), upload full video to Firebase Storage
          const thumb = await generateVideoThumbnail(file);
          if (thumb) {
            const compressedThumb = await compressImageForFirestore(thumb, 150000);
            const { url: thumbUrl, id: thumbId } = await uploadFile(compressedThumb);
            thumbnailId = thumbId;
            thumbnailUrl = thumbUrl;
          }
          try {
            // Upload full video to Cloudinary so it plays for all users
            const { url: videoUrl, id: videoId } = await uploadToCloudinary(file);
            mediaIds.push(videoId);
            mediaUrls.push(videoUrl);
          } catch (err) {
            console.error("Cloudinary video upload failed:", err);
            setUploadError("Video uploaded to this device only. Cloudinary upload failed.");
            // Fallback: store in IndexedDB (only works on this device)
            const videoId = await storeFile(file);
            mediaIds.push(videoId);
          }
        }
      }

      // Create the post (Firebase or localStorage)
      await fbCreatePost({
        authorUsername: currentUser.username,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        caption,
        hashtags,
        type: isVideo ? "video" : "photo",
        mediaIds,
        mediaUrls,
        thumbnailId,
        thumbnailUrl,
        privacy: privacy as "Public" | "Friends" | "Private",
        allowDownload: toggleStates["Allow Download"] ?? false,
        allowComments: true,
        allowDuet: toggleStates["Allow Duet"] ?? true,
      });

      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setCaption("");
      setHashtags("");

      setPublished(true);
      setShowPublish(false);
      setUploading(false);
      setTimeout(() => {
        setPublished(false);
        router.push("/profile");
      }, 2500);
    } catch (err) {
      console.error("Publish error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to upload. Please try again.";
      // Check for Firestore size limit error
      if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("exceeds the maximum") || errorMsg.includes("size")) {
        setUploadError("Image too large. Try a smaller image or lower resolution.");
      } else {
        setUploadError(errorMsg);
      }
      setUploading(false);
    }
  };

  // Handle ad image selection
  const handleAdImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const compressed = await compressImageForFirestore(file, 500000);
      const { url, id } = await uploadFile(compressed);
      setAdImageId(id);
      setAdImageUrl(url);
    } catch (err) {
      console.error("Ad image upload error:", err);
      setUploadError("Failed to upload image. Please try a smaller file.");
    }
  };

  // Publish ad to marketplace
  const handlePublishAd = async () => {
    if (!currentUser) {
      setUploadError("Please log in to post an ad");
      return;
    }
    if (!adTitle.trim() || !adPrice.trim()) {
      setUploadError("Please add a title and price");
      return;
    }

    setAdPublishing(true);
    setUploadError(null);

    try {
      // Store ad in localStorage
      const adsKey = "voxel_ads";
      const existingAds = JSON.parse(localStorage.getItem(adsKey) || "[]");
      const newAd = {
        id: `ad_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        title: adTitle.trim(),
        description: adDescription.trim(),
        price: adPrice.trim(),
        category: adCategory,
        imageId: adImageId,
        sellerUsername: currentUser.username,
        sellerName: currentUser.name,
        sellerAvatar: currentUser.avatar,
        createdAt: Date.now(),
      };
      existingAds.push(newAd);
      localStorage.setItem(adsKey, JSON.stringify(existingAds));

      // Reset state
      setAdTitle("");
      setAdDescription("");
      setAdPrice("");
      setAdCategory("Beauty");
      setAdImageId(null);
      if (adImageUrl) URL.revokeObjectURL(adImageUrl);
      setAdImageUrl(null);
      setAdPublishing(false);
      setShowAdModal(false);

      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        router.push("/marketplace");
      }, 2500);
    } catch (err) {
      console.error("Ad publish error:", err);
      setUploadError("Failed to post ad. Please try again.");
      setAdPublishing(false);
    }
  };

  const handleMusicPreview = (track: string) => {
    if (musicPlaying === track) {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      setMusicPlaying(null);
      return;
    }
    setMusicPlaying(track);
    setSelectedMusic(track);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => setMusicPlaying(null), 500);
    } catch {
      setTimeout(() => setMusicPlaying(null), 500);
    }
  };

  const handleGenerateCaptions = () => {
    setIsGeneratingCaptions(true);
    setGeneratedCaptions(null);
    setTimeout(() => {
      setGeneratedCaptions("🎤 Auto-generated captions will appear here in your final video.");
      setIsGeneratingCaptions(false);
    }, 2000);
  };

  const handleVoiceoverRecord = async () => {
    if (isVoiceoverRecording) {
      voiceoverRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setVoiceoverTime(0);
      voiceoverChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceoverChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(voiceoverChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setVoiceoverUrl(url);
        setIsVoiceoverRecording(false);
        setVoiceoverTime(0);
        if (voiceoverTimerRef.current) clearInterval(voiceoverTimerRef.current);
      };
      voiceoverRecorderRef.current = recorder;
      recorder.start(100);
      setIsVoiceoverRecording(true);
      voiceoverTimerRef.current = setInterval(() => setVoiceoverTime((t) => t + 1), 1000);
    } catch {
      setUploadError("Microphone access denied.");
    }
  };

  const handleDeleteVoiceover = () => {
    if (voiceoverUrl) URL.revokeObjectURL(voiceoverUrl);
    setVoiceoverUrl(null);
  };

  const handleSaveDraft = () => {
    const id = `draft_${Date.now()}`;
    const data = {
      caption,
      hashtags,
      privacy,
      selectedMusic,
      selectedEffect,
      selectedBackground,
      generatedCaptions,
      aiEnhancements,
      trimStart,
      trimEnd,
      voiceoverUrl,
    };
    const newDraft = { id, title: caption || "Untitled draft", data, createdAt: Date.now() };
    const next = [newDraft, ...drafts].slice(0, 20);
    setDrafts(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("voxel_create_drafts", JSON.stringify(next));
    }
  };

  const handleLoadDraft = (draft: typeof drafts[0]) => {
    setCaption(draft.data.caption as string);
    setHashtags(draft.data.hashtags as string);
    setPrivacy(draft.data.privacy as string);
    setSelectedMusic(draft.data.selectedMusic as string | null);
    setSelectedEffect(draft.data.selectedEffect as string | null);
    setSelectedBackground(draft.data.selectedBackground as string | null);
    setGeneratedCaptions(draft.data.generatedCaptions as string | null);
    setAiEnhancements(draft.data.aiEnhancements as string[]);
    setTrimStart(draft.data.trimStart as number);
    setTrimEnd(draft.data.trimEnd as number);
    setVoiceoverUrl(draft.data.voiceoverUrl as string | null);
    setActivePanel(null);
  };

  const handleDeleteDraft = (id: string) => {
    const next = drafts.filter((d) => d.id !== id);
    setDrafts(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("voxel_create_drafts", JSON.stringify(next));
    }
  };

  const effectMap: Record<string, string> = {
    "✨": "brightness(1.15)",
    "🔥": "contrast(1.2)",
    "💫": "saturate(1.5)",
    "🌟": "sepia(0.4)",
    "💎": "grayscale(1)",
    "🎨": "hue-rotate(90deg)",
    "🌈": "invert(1)",
    "⚡": "blur(2px)",
  };

  const backgroundMap: Record<string, string> = {
    "Beach": "linear-gradient(to bottom right, #38bdf8, #f0abfc)",
    "Studio": "linear-gradient(to bottom right, #4b5563, #1f2937)",
    "City": "linear-gradient(to bottom right, #7c3aed, #db2777)",
    "Nature": "linear-gradient(to bottom right, #22c55e, #064e3b)",
    "Abstract": "linear-gradient(to bottom right, #f97316, #8b5cf6, #ec4899)",
    "Solid": "#000000",
  };

  const musicList = [
    { name: "Afrobeats Mix", artist: "DJ Flex", duration: 90, trending: true },
    { name: "Highlife Remix", artist: "Nana Ama", duration: 75, trending: true },
    { name: "Amapiano Beat", artist: "Kojo 360", duration: 90, trending: true },
    { name: "Ghana Drill", artist: "Kwame Jr", duration: 60, trending: false },
    { name: "Hiplife Vibes", artist: "Ama Serwaa", duration: 90, trending: true },
    { name: "Saxophone Soul", artist: "Kofi M", duration: 45, trending: false },
    { name: "Gospel Praise", artist: "Grace Voices", duration: 90, trending: false },
    { name: "Dancehall Heat", artist: "Ras Kofi", duration: 60, trending: true },
    { name: "Afro Pop", artist: "Adwoa B", duration: 75, trending: false },
    { name: "Traditional Drums", artist: "Ga Mashie", duration: 30, trending: false },
    { name: "Reggae Roots", artist: "Irie Man", duration: 90, trending: false },
    { name: "Hip Hop Accra", artist: "Young T", duration: 60, trending: true },
    { name: "Jazz Lounge", artist: "The Natives", duration: 75, trending: false },
    { name: "Electronic Pulse", artist: "Synth K", duration: 90, trending: false },
    { name: "Wedding Bells", artist: "Ama & Kofi", duration: 60, trending: false },
    { name: "Street Anthems", artist: "Accra Boyz", duration: 90, trending: true },
  ];

  const panelContent: Record<string, { title: string; content: React.ReactNode }> = {
    upload: { title: "Upload Media", content: <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 sm:p-8 text-center touch-feedback cursor-pointer" onClick={() => fileInputRef.current?.click()}><Upload className="w-10 h-10 sm:w-16 sm:h-16 mx-auto text-vox-muted mb-3" /><p className="text-sm sm:text-base font-semibold text-white">Drag & drop or click to upload</p><p className="text-xs text-vox-muted mt-1">MP4, MOV, JPG, PNG up to 500MB</p><button className="mt-4 btn-gradient rounded-full px-4 py-2 text-sm font-semibold text-white touch-feedback" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</button></div> },
    "ai-edit": { title: "AI Edit", content: <div className="space-y-3">{["Auto color correction", "Stabilization", "Noise reduction", "Smart cropping"].map((f) => <button key={f} onClick={() => { setAiEnhancements((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]); }} className={aiEnhancements.includes(f) ? "w-full text-left p-3 rounded-xl touch-feedback transition-colors flex items-center justify-between text-sm bg-vox-green/20 border border-vox-green text-white" : "w-full text-left p-3 rounded-xl touch-feedback transition-colors flex items-center justify-between text-sm bg-white/[0.04] text-white hover:bg-white/[0.08]"}><span>{f}</span>{aiEnhancements.includes(f) ? <Check className="w-4 h-4 text-vox-green" /> : null}</button>)}</div> },
    music: { title: "Add Music", content: <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted" />
        <input
          type="text"
          value={musicSearch}
          onChange={(e) => setMusicSearch(e.target.value)}
          placeholder="Search for music or artists..."
          className="w-full h-11 pl-10 pr-4 rounded-full bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-pink/50 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["all", "All"], ["trending", "Trending"], ["favorites", "Favorites"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMusicFavTab(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold touch-feedback transition-all ${musicFavTab === key ? "bg-vox-pink/20 border border-vox-pink text-white" : "bg-white/[0.04] text-vox-muted hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Duration selector */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-vox-muted">Clip length: {musicDuration}s</label>
          <span className="text-[10px] text-vox-muted/60">Max 90s</span>
        </div>
        <input
          type="range"
          min="15"
          max="90"
          step="15"
          value={musicDuration}
          onChange={(e) => setMusicDuration(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "#ec4899" }}
        />
      </div>

      {/* Track list */}
      <div className="space-y-2 max-h-[45vh] overflow-y-auto scrollbar-hide">
        {musicList
          .filter((s) => {
            if (musicFavTab === "favorites") return musicFavorites.includes(s.name);
            if (musicFavTab === "trending") return s.trending;
            return true;
          })
          .filter((s) => {
            if (!musicSearch.trim()) return true;
            const q = musicSearch.toLowerCase();
            return s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
          })
          .length === 0 ? (
          <p className="text-center text-sm text-vox-muted py-6">
            {musicFavTab === "favorites" ? "No favorites yet. Tap the heart on a track to save it." : "No tracks found."}
          </p>
        ) : musicList
          .filter((s) => {
            if (musicFavTab === "favorites") return musicFavorites.includes(s.name);
            if (musicFavTab === "trending") return s.trending;
            return true;
          })
          .filter((s) => {
            if (!musicSearch.trim()) return true;
            const q = musicSearch.toLowerCase();
            return s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
          })
          .map((s) => (
          <div
            key={s.name}
            className={`w-full flex items-center justify-between p-3 rounded-xl touch-feedback transition-colors ${selectedMusic === s.name ? "bg-vox-pink/20 border border-vox-pink" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}
          >
            <button onClick={() => handleMusicPreview(s.name)} className="flex-1 text-left min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {s.name} <span className="text-vox-muted font-normal">— {s.artist}</span>
                {s.trending && <span className="ml-2 text-[10px] text-vox-orange font-bold">🔥 TRENDING</span>}
              </p>
              <p className="text-xs text-vox-muted">{Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, "0")} clip · {Math.floor(s.duration / 60)}:{(s.duration % 60).toString().padStart(2, "0")} full</p>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleMusicFavorite(s.name)} className="touch-feedback p-1">
                <Heart className={`w-4 h-4 ${musicFavorites.includes(s.name) ? "fill-vox-pink text-vox-pink" : "text-vox-muted hover:text-white"}`} />
              </button>
              <span className="text-xs text-vox-pink">{musicPlaying === s.name ? "Playing..." : selectedMusic === s.name ? "Selected" : "Preview"}</span>
            </div>
          </div>
        ))}
      </div>
    </div> },
    trim: { title: "Trim & Split", content: <div className="space-y-4 px-1"><p className="text-sm text-vox-muted">Select start and end points</p><div className="space-y-2"><label className="text-xs text-vox-muted">Start: {trimStart}%</label><input type="range" min="0" max={trimEnd - 5} value={trimStart} onChange={(e) => setTrimStart(Number(e.target.value))} className="w-full" style={{ accentColor: "#ec4899" }} /></div><div className="space-y-2"><label className="text-xs text-vox-muted">End: {trimEnd}%</label><input type="range" min={trimStart + 5} max="100" value={trimEnd} onChange={(e) => setTrimEnd(Number(e.target.value))} className="w-full" style={{ accentColor: "#ec4899" }} /></div><p className="text-xs text-vox-muted">Preview control only. Real trimming not supported in browser.</p></div> },
    captions: { title: "Auto Captions", content: <div className="space-y-3"><button onClick={handleGenerateCaptions} disabled={isGeneratingCaptions} className="btn-gradient w-full rounded-full py-2.5 text-sm font-semibold text-white touch-feedback disabled:opacity-60">{isGeneratingCaptions ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Generating...</> : "Generate Captions"}</button>{generatedCaptions && <div className="p-3 rounded-xl bg-white/[0.04] text-sm text-white border border-white/10">{generatedCaptions}</div>}</div> },
    effects: { title: "Effects & Filters", content: <div className="grid grid-cols-4 gap-2">{["✨", "🔥", "💫", "🌟", "💎", "🎨", "🌈", "⚡"].map((e) => <button key={e} onClick={() => setSelectedEffect(selectedEffect === e ? null : e)} className={selectedEffect === e ? "aspect-square rounded-xl touch-feedback transition-colors flex items-center justify-center text-2xl bg-vox-pink/30 border border-vox-pink" : "aspect-square rounded-xl touch-feedback transition-colors flex items-center justify-center text-2xl bg-white/[0.06] hover:bg-white/[0.12]"}>{e}</button>)}</div> },
    background: { title: "Virtual Background", content: <div className="grid grid-cols-3 gap-2">{["Beach", "Studio", "City", "Nature", "Abstract", "Solid"].map((bg) => <button key={bg} onClick={() => setSelectedBackground(selectedBackground === bg ? null : bg)} className={selectedBackground === bg ? "aspect-video rounded-xl touch-feedback transition-colors flex items-center justify-center text-xs font-medium ring-2 ring-vox-pink" : "aspect-video rounded-xl touch-feedback transition-colors flex items-center justify-center text-xs font-medium"} style={{ background: backgroundMap[bg] }}><span className="drop-shadow-md text-white/90">{bg}</span></button>)}</div> },
    voiceover: { title: "Voiceover", content: <div className="space-y-4 text-center py-2">{voiceoverUrl ? <div className="space-y-3"><audio src={voiceoverUrl} controls className="w-full" /><button onClick={handleDeleteVoiceover} className="text-xs text-red-400 hover:text-red-300 touch-feedback">Delete voiceover</button></div> : <><button onClick={handleVoiceoverRecord} className={isVoiceoverRecording ? "w-16 h-16 rounded-full flex items-center justify-center mx-auto touch-feedback transition-colors bg-red-600 animate-pulse" : "w-16 h-16 rounded-full flex items-center justify-center mx-auto touch-feedback transition-colors bg-gradient-to-br from-vox-purple to-vox-pink"}><span className="text-2xl">🎙️</span></button><p className="text-sm text-vox-muted">{isVoiceoverRecording ? `Recording... ${voiceoverTime}s (tap to stop)` : "Tap to record voiceover"}</p></>}</div> },
    remix: { title: "Remix Content", content: <div className="text-center py-6"><p className="text-sm text-vox-muted">Select a video from your feed to remix</p><button onClick={() => router.push("/")} className="mt-3 btn-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl touch-feedback">Browse Feed</button></div> },
    photo: { title: "Take Photo", content: <div className="text-center py-6"><ImageIcon className="w-12 h-12 mx-auto text-vox-muted mb-3" /><p className="text-sm text-vox-muted">Upload a photo from your device</p><button onClick={() => photoInputRef.current?.click()} className="mt-3 btn-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl touch-feedback">Choose Photo</button></div> },
    drafts: { title: "Saved Drafts", content: <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">{drafts.length === 0 ? <p className="text-center text-sm text-vox-muted py-6">No drafts saved yet</p> : drafts.map((d) => <div key={d.id} className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-sm text-white truncate font-medium">{d.title}</p><p className="text-xs text-vox-muted">{new Date(d.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-1"><button onClick={() => handleLoadDraft(d)} className="px-3 py-1.5 rounded-lg bg-vox-purple/20 text-xs text-white touch-feedback">Load</button><button onClick={() => handleDeleteDraft(d.id)} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-xs text-red-400 touch-feedback">Del</button></div></div>)}<button onClick={handleSaveDraft} className="w-full btn-gradient rounded-full py-2.5 text-sm font-semibold text-white touch-feedback">Save Current as Draft</button></div> },
  };

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-hide pb-16 lg:pb-0">
      {/* ═══════ STICKY HEADER ═══════ */}
      <div
        style={{ paddingTop: "var(--safe-top)" }}
        className="sticky top-0 z-30 glass-strong backdrop-blur-xl px-3 sm:px-4 pb-3"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Create</h1>
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full glass touch-feedback flex items-center justify-center"
          >
            <X className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
      </div>

      {/* ═══════ HEADER ═══════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative px-3 sm:px-4 pt-6 pb-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-vox-purple/10 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-1/4 w-60 h-60 bg-vox-pink/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-purple to-vox-pink flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">VOX <span className="text-gradient">Studio</span></h1>
              <p className="text-vox-muted text-sm">Create something amazing</p>
            </div>
          </motion.div>

          {/* Main Upload Actions */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Upload Photo */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => photoInputRef.current?.click()}
              className="glass-strong rounded-2xl py-4 flex flex-col items-center gap-2 touch-feedback group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-cyan/30 to-vox-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-vox-cyan" />
              </div>
              <span className="text-white font-semibold text-xs sm:text-sm">Upload Photo</span>
            </motion.button>

            {/* Upload Video */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="btn-gradient rounded-2xl py-4 flex flex-col items-center gap-2 touch-feedback group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-xs sm:text-sm">Upload Video</span>
            </motion.button>

            {/* Post Ad */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdModal(true)}
              className="glass-strong rounded-2xl py-4 flex flex-col items-center gap-2 touch-feedback group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-orange/30 to-vox-pink/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5 text-vox-orange" />
              </div>
              <span className="text-white font-semibold text-xs sm:text-sm">Post Ad</span>
            </motion.button>

            {/* VOXLIVE */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/live")}
              className="bg-gradient-to-br from-vox-danger to-vox-pink rounded-2xl py-4 flex flex-col items-center gap-2 touch-feedback group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-xs sm:text-sm">VOXLIVE</span>
            </motion.button>
          </div>

          {/* Quick tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-vox-muted mt-4"
          >
            Choose how you want to create. Upload photos, videos, post an ad, or go live with VOXLIVE.
          </motion.p>
        </div>
      </motion.div>

      {/* ═══════ PAGE CONTENT ═══════ */}
      <div className="px-3 sm:px-4 pb-6 space-y-8 max-w-3xl mx-auto">
        {/* ── TOOL GRID ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-vox-orange" />
            <h2 className="text-base sm:text-lg font-bold text-white">Creator Tools</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToolClick(tool)}
                className="glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 touch-feedback card-hover group"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-xl">{tool.icon}</span>
                </div>
                <span className="text-xs font-medium text-vox-muted group-hover:text-white transition-colors leading-tight text-center">{tool.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── AI PUBLISHING CHECK ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vox-purple/30 to-vox-cyan/30 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-vox-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Publishing Check</h3>
                <p className="text-xs text-vox-muted">Auto-review before you post</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {aiChecks.map((check, i) => {
                const checked = aiChecked.has(check.label);
                return (
                  <motion.button
                    key={check.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                    onClick={() => handleAiCheck(check.label)}
                    className={`glass rounded-xl p-3 flex flex-col gap-2 touch-feedback card-hover group text-left relative ${checked ? "border border-vox-green/30" : ""}`}
                  >
                    {checked && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-vox-green/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-vox-green" />
                      </div>
                    )}
                    <check.icon className={`w-5 h-5 ${check.color} group-hover:scale-110 transition-transform`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{check.label}</p>
                      <p className="text-[11px] text-vox-muted leading-tight mt-0.5">{check.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── CONTENT CONTROLS ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vox-orange/30 to-vox-pink/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-vox-orange" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Content Controls</h3>
                <p className="text-[11px] text-vox-muted">Manage how others interact with your content</p>
              </div>
            </div>
            <div className="space-y-1">
              {contentControls.map((control, i) => (
                <motion.div
                  key={control.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
                  className="flex items-center justify-between py-3 px-1 border-b border-white/[0.04] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{control.label}</p>
                    <p className="text-[11px] text-vox-muted mt-0.5">{control.desc}</p>
                  </div>
                  <button onClick={() => handleToggle(control.label)} className="shrink-0 ml-4 touch-feedback transition-colors">
                    {toggleStates[control.label] ? (
                      <ToggleRight className="w-9 h-9 text-vox-green" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-vox-muted" />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* ═══════ RECORDING OVERLAY (TikTok style) ═══════ */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black"
          >
            {/* Full-screen camera */}
            <video
              ref={(el) => {
                recordVideoRef.current = el;
                if (el && recordStreamRef.current && el.srcObject !== recordStreamRef.current) {
                  el.srcObject = recordStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{
                transform: recordFacingMode === "user" ? "scaleX(-1)" : undefined,
                filter: selectedEffect ? effectMap[selectedEffect] : undefined,
                opacity: recordCameraReady ? 1 : 0,
              }}
            />
            {!recordCameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-white/60 text-sm">Starting camera...</p>
              </div>
            )}

            {/* Top gradient */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

            {/* Top bar */}
            <div
              className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4"
              style={{ paddingTop: "calc(var(--safe-top, 0px) + 16px)" }}
            >
              <button
                onClick={() => setIsRecording(false)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm touch-feedback flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3.5 py-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-mono font-bold">{formatTime(recordTime)}</span>
              </div>
              <div className="w-10 h-10" />
            </div>

            {/* Right side controls */}
            <div className="absolute right-3 top-1/4 flex flex-col items-center gap-5">
              <button
                onClick={handleFlipRecordCamera}
                className="flex flex-col items-center gap-1 touch-feedback"
              >
                <span className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-xl">🔄</span>
                <span className="text-white text-[10px] font-medium drop-shadow">Flip</span>
              </button>
              <button
                onClick={() => setShowRecordEffects((v) => !v)}
                className="flex flex-col items-center gap-1 touch-feedback"
              >
                <span className={`w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center text-xl ${showRecordEffects ? "bg-vox-pink/60" : "bg-black/40"}`}>✨</span>
                <span className="text-white text-[10px] font-medium drop-shadow">Effects</span>
              </button>
              {selectedEffect && (
                <button
                  onClick={() => setSelectedEffect(null)}
                  className="flex flex-col items-center gap-1 touch-feedback"
                >
                  <span className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-xl">🚫</span>
                  <span className="text-white text-[10px] font-medium drop-shadow">Clear</span>
                </button>
              )}
            </div>

            {/* Effects strip */}
            <AnimatePresence>
              {showRecordEffects && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="absolute bottom-36 inset-x-0 flex justify-center"
                >
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-2">
                    {Object.keys(effectMap).map((e) => (
                      <button
                        key={e}
                        onClick={() => setSelectedEffect(selectedEffect === e ? null : e)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg touch-feedback transition-all ${selectedEffect === e ? "bg-vox-pink/60 scale-110" : "bg-white/10"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            {/* Bottom controls */}
            <div
              className="absolute bottom-0 inset-x-0 flex flex-col items-center pb-8"
              style={{ paddingBottom: "calc(var(--safe-bottom, 0px) + 32px)" }}
            >
              <button
                onClick={handleStopRecording}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center touch-feedback"
              >
                <span className="w-8 h-8 bg-red-500 rounded-md" />
              </button>
              <p className="text-white/80 text-xs mt-3 drop-shadow">Tap to stop recording</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PUBLISH MODAL ═══════ */}
      <AnimatePresence>
        {showPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPublish(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong sheet-up rounded-3xl p-4 sm:p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedFiles.length > 0 && selectedFiles[0].type.startsWith("video/") ? "Publish Video" : "Publish Post"}
                </h3>
                <button onClick={() => setShowPublish(false)} className="w-10 h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white"><X className="w-4.5 h-4.5" /></button>
              </div>

              {/* Preview */}
              {previewUrls.length > 0 ? (
                <div className="w-full rounded-xl overflow-hidden bg-black/40" style={{ background: selectedBackground ? backgroundMap[selectedBackground] : undefined }}>
                  {selectedFiles[0].type.startsWith("video/") ? (
                    <video
                      src={previewUrls[0]}
                      controls
                      className="w-full max-h-[300px] object-contain"
                      style={{ filter: selectedEffect ? effectMap[selectedEffect] : undefined }}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {previewUrls.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover object-top rounded-lg" style={{ filter: selectedEffect ? effectMap[selectedEffect] : undefined }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-vox-purple/20 to-vox-pink/20 flex items-center justify-center">
                  <Video className="w-10 h-10 text-white/30" />
                </div>
              )}

              {/* Upload error */}
              {uploadError && (
                <div className="glass rounded-xl px-4 py-2.5 text-xs text-red-400 border border-red-400/20">
                  {uploadError}
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-base focus:outline-none focus:border-vox-purple resize-none min-h-[80px]"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#afrobeats #dance #ghana"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-base focus:outline-none focus:border-vox-purple"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Privacy</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {privacyOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setPrivacy(opt.label)}
                      className={`glass rounded-2xl p-3 flex flex-col items-center gap-1.5 touch-feedback transition-all ${privacy === opt.label ? "border border-vox-purple" : ""}`}
                    >
                      <opt.icon className={`w-5 h-5 ${privacy === opt.label ? "text-vox-purple" : "text-vox-muted"}`} />
                      <span className={`text-sm font-medium ${privacy === opt.label ? "text-white" : "text-vox-muted"}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={uploading}
                className="btn-gradient rounded-full w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white touch-feedback flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Now
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TOOL PANEL MODAL ═══════ */}
      <AnimatePresence>
        {activePanel && panelContent[activePanel] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel(null)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong sheet-up rounded-3xl p-4 sm:p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white">{panelContent[activePanel].title}</h3>
                <button onClick={() => setActivePanel(null)} className="w-10 h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white"><X className="w-4.5 h-4.5" /></button>
              </div>
              {panelContent[activePanel].content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PUBLISHED SUCCESS ═══════ */}
      <AnimatePresence>
        {published && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="glass rounded-3xl p-8 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-vox-green/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-vox-green" />
              </div>
              <p className="text-lg font-bold text-white">Published!</p>
              <p className="text-sm text-vox-muted">Your video is now live</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ POST AD MODAL ═══════ */}
      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdModal(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong sheet-up rounded-3xl p-4 sm:p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vox-orange/30 to-vox-pink/30 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-vox-orange" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Post an Ad</h3>
                </div>
                <button onClick={() => setShowAdModal(false)} className="w-10 h-10 rounded-full glass touch-feedback flex items-center justify-center text-vox-muted hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Product Image</label>
                {adImageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={adImageUrl} alt="Ad preview" className="w-full h-48 object-cover rounded-2xl" />
                    <button
                      onClick={() => { if (adImageUrl) URL.revokeObjectURL(adImageUrl); setAdImageUrl(null); setAdImageId(null); }}
                      className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => adFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/10 rounded-2xl p-6 sm:p-8 text-center touch-feedback hover:border-vox-purple/30 transition"
                  >
                    <ImageIcon className="w-10 h-10 mx-auto text-vox-muted mb-2" />
                    <p className="text-sm text-white font-medium">Upload product image</p>
                    <p className="text-xs text-vox-muted mt-1">JPG, PNG up to 10MB</p>
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Title</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted" />
                  <input
                    type="text"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="e.g. Premium Lace Frontal Wig"
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-vox-muted mb-1.5 block">Description</label>
                <textarea
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple resize-none min-h-[80px]"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-vox-muted mb-1.5 block">Price (₵)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vox-muted" />
                    <input
                      type="text"
                      value={adPrice}
                      onChange={(e) => setAdPrice(e.target.value)}
                      placeholder="250"
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base placeholder:text-vox-muted/60 focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-vox-muted mb-1.5 block">Category</label>
                  <select
                    value={adCategory}
                    onChange={(e) => setAdCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-base focus:outline-none focus:border-vox-purple/50 focus:ring-2 focus:ring-vox-purple/50 transition-all"
                  >
                    {["Beauty", "Fashion", "Electronics", "Home", "Food", "Services", "Other"].map((cat) => (
                      <option key={cat} value={cat} className="bg-vox-bg">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error */}
              {uploadError && (
                <div className="glass rounded-xl px-4 py-2.5 text-xs text-red-400 border border-red-400/20">
                  {uploadError}
                </div>
              )}

              {/* Publish button */}
              <button
                onClick={handlePublishAd}
                disabled={adPublishing}
                className="btn-gradient rounded-full w-full px-5 py-3 text-sm font-semibold text-white touch-feedback flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {adPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting Ad...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Post to Marketplace
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HIDDEN FILE INPUTS ═══════ */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        onChange={handleFileSelect}
        className="sr-only"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="sr-only"
      />
      <input
        ref={adFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAdImageSelect}
        className="sr-only"
      />
    </div>
  );
}
