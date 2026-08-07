"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Bookmark,
  Send,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  getUserPosts,
  getFileURL,
  toggleLike,
  toggleSave,
  addComment,
  incrementShare,
  incrementView,
  deletePost,
  downloadFile,
  timeAgo,
  formatCount,
  type Post,
} from "@/lib/content-store";
import { useAuth } from "@/lib/auth-context";

interface UserPostsGridProps {
  username: string;
  emptyMessage?: string;
}

export default function UserPostsGrid({ username, emptyMessage = "No posts yet" }: UserPostsGridProps) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadPosts = useCallback(() => {
    const userPosts = getUserPosts(username).sort((a, b) => b.createdAt - a.createdAt);
    setPosts(userPosts);
    setLoaded(true);
  }, [username]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Load media URLs for all posts
  useEffect(() => {
    let cancelled = false;
    const urls: Record<string, string> = {};
    const allMediaIds = posts.flatMap((p) => [
      ...(p.thumbnailId ? [p.thumbnailId] : []),
      ...p.mediaIds,
    ]);
    Promise.all(
      allMediaIds.map(async (id) => {
        const url = await getFileURL(id);
        if (url) urls[id] = url;
      }),
    ).then(() => {
      if (!cancelled) setMediaUrls(urls);
    });
    return () => {
      cancelled = true;
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [posts]);

  const handleLike = (postId: string) => {
    toggleLike(postId);
    loadPosts();
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => prev ? { ...prev, likedByMe: !prev.likedByMe, likes: prev.likedByMe ? prev.likes - 1 : prev.likes + 1 } : null);
    }
  };

  const handleSave = (postId: string) => {
    toggleSave(postId);
    loadPosts();
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => prev ? { ...prev, savedByMe: !prev.savedByMe } : null);
    }
  };

  const handleShare = (postId: string) => {
    incrementShare(postId);
    if (navigator.share) {
      navigator.share({ title: "VOXel Post", text: "Check out this post on VOXel!", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
    loadPosts();
  };

  const handleDownload = async (postId: string, mediaId: string) => {
    const post = posts.find((p) => p.id === postId);
    const ext = post?.type === "video" ? "mp4" : "jpg";
    await downloadFile(mediaId, `voxel_${postId}.${ext}`);
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim() || !currentUser) return;
    addComment(postId, {
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: commentText.trim(),
    });
    setCommentText("");
    loadPosts();
    if (selectedPost?.id === postId) {
      const updated = getUserPosts(username).find((p) => p.id === postId);
      if (updated) setSelectedPost(updated);
    }
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    setSelectedPost(null);
    setShowMenu(false);
    loadPosts();
  };

  const openPost = (post: Post) => {
    incrementView(post.id);
    setSelectedPost(post);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
          <Play className="w-7 h-7 text-vox-muted" />
        </div>
        <p className="text-vox-muted text-sm">{emptyMessage}</p>
        {currentUser?.username === username && (
          <p className="text-vox-muted text-xs mt-2">Tap Create to share your first post!</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {posts.map((post, i) => (
          <motion.button
            key={post.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => openPost(post)}
            className="relative aspect-[9/16] rounded-xl overflow-hidden touch-feedback group cursor-pointer bg-white/[0.04]"
          >
            {/* Thumbnail */}
            {mediaUrls[post.thumbnailId || post.mediaIds[0]] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrls[post.thumbnailId || post.mediaIds[0]]}
                alt={post.caption}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Type badge */}
            {post.type === "video" && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
            )}

            {/* Stats */}
            <div className="absolute bottom-1.5 left-2 flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-white font-medium">
                <Heart className={`w-3 h-3 ${post.likedByMe ? "fill-vox-pink text-vox-pink" : ""}`} />
                {formatCount(post.likes)}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white font-medium">
                <MessageCircle className="w-3 h-3" />
                {formatCount(post.comments.length)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedPost(null); setShowMenu(false); }}
            className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide glass-strong rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06] sticky top-0 glass-strong z-10 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[2px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedPost.authorAvatar} alt={selectedPost.authorName} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedPost.authorName}</p>
                    <p className="text-[10px] text-vox-muted">{timeAgo(selectedPost.createdAt)}</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-full glass flex items-center justify-center text-white touch-feedback">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-11 glass rounded-xl p-1.5 w-40 z-20">
                      {currentUser?.username === selectedPost.authorUsername && (
                        <button
                          onClick={() => handleDelete(selectedPost.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Post
                        </button>
                      )}
                      {selectedPost.allowDownload && (
                        <button
                          onClick={() => handleDownload(selectedPost.id, selectedPost.mediaIds[0])}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white hover:bg-white/10 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Media */}
              <div className="relative bg-black/40">
                {selectedPost.type === "video" && mediaUrls[selectedPost.mediaIds[0]] ? (
                  <video
                    src={mediaUrls[selectedPost.mediaIds[0]]}
                    controls
                    autoPlay
                    className="w-full max-h-[400px] object-contain"
                  />
                ) : mediaUrls[selectedPost.mediaIds[0]] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrls[selectedPost.mediaIds[0]]} alt={selectedPost.caption} className="w-full max-h-[400px] object-contain" />
                ) : (
                  <div className="w-full aspect-[9/16] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
                  </div>
                )}
              </div>

              {/* Caption */}
              {selectedPost.caption && (
                <div className="px-4 py-3">
                  <p className="text-sm text-white whitespace-pre-wrap">{selectedPost.caption}</p>
                  {selectedPost.hashtags && (
                    <p className="text-xs text-vox-cyan mt-1">{selectedPost.hashtags}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.06]">
                <button onClick={() => handleLike(selectedPost.id)} className="flex items-center gap-1.5 touch-feedback">
                  <Heart className={`w-5 h-5 ${selectedPost.likedByMe ? "fill-vox-pink text-vox-pink" : "text-white"}`} />
                  <span className="text-xs text-white">{formatCount(selectedPost.likes)}</span>
                </button>
                <button className="flex items-center gap-1.5 touch-feedback">
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span className="text-xs text-white">{formatCount(selectedPost.comments.length)}</span>
                </button>
                <button onClick={() => handleShare(selectedPost.id)} className="flex items-center gap-1.5 touch-feedback">
                  <Share2 className="w-5 h-5 text-white" />
                  <span className="text-xs text-white">{formatCount(selectedPost.shares)}</span>
                </button>
                <button onClick={() => handleSave(selectedPost.id)} className="flex items-center gap-1.5 touch-feedback ml-auto">
                  <Bookmark className={`w-5 h-5 ${selectedPost.savedByMe ? "fill-vox-cyan text-vox-cyan" : "text-white"}`} />
                </button>
              </div>

              {/* Comments */}
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <p className="text-xs font-semibold text-white mb-3">Comments ({selectedPost.comments.length})</p>
                <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-hide">
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-xs text-vox-muted text-center py-4">No comments yet. Be the first!</p>
                  ) : (
                    selectedPost.comments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[1.5px] flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.authorAvatar} alt={c.authorName} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-white">{c.authorName}</span>
                            <span className="text-[10px] text-vox-muted">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-xs text-white/90 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                {currentUser && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[1.5px] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment(selectedPost.id)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/[0.06] border border-white/10 rounded-full px-3 py-2 text-xs text-white placeholder:text-vox-muted focus:outline-none focus:border-vox-purple/50"
                    />
                    <button
                      onClick={() => handleComment(selectedPost.id)}
                      disabled={!commentText.trim()}
                      className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
