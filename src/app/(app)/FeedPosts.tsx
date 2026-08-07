"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Bookmark,
  X,
  Send,
} from "lucide-react";
import {
  subscribeToFeedPosts,
  toggleLike,
  toggleSave,
  addComment,
  incrementShare,
  incrementView,
  downloadFile,
  timeAgo,
  formatCount,
  type Post,
} from "@/lib/firebase-store";
import { useAuth } from "@/lib/auth-context";

export default function FeedPosts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Real-time subscription to feed posts
  useEffect(() => {
    const unsubscribe = subscribeToFeedPosts((feedPosts) => {
      setPosts(feedPosts);
      setLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => prev ? {
        ...prev,
        likedByMe: !prev.likedByMe,
        likes: prev.likedByMe ? prev.likes - 1 : prev.likes + 1,
      } : null);
    }
  };

  const handleSave = async (postId: string) => {
    await toggleSave(postId);
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => prev ? { ...prev, savedByMe: !prev.savedByMe } : null);
    }
  };

  const handleShare = async (postId: string) => {
    await incrementShare(postId);
    if (navigator.share) {
      navigator.share({ title: "VOXel Post", text: "Check out this post!", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleDownload = async (postId: string, mediaId: string) => {
    const post = posts.find((p) => p.id === postId);
    const ext = post?.type === "video" ? "mp4" : "jpg";
    await downloadFile(mediaId, `voxel_${postId}.${ext}`);
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim() || !currentUser) return;
    await addComment(postId, {
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: commentText.trim(),
    });
    setCommentText("");
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => prev ? {
        ...prev,
        comments: [...prev.comments, {
          id: `comment_${Date.now()}`,
          authorUsername: currentUser.username,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          text: commentText.trim(),
          createdAt: Date.now(),
          likes: 0,
        }],
      } : null);
    }
  };

  const openPost = async (post: Post) => {
    await incrementView(post.id);
    setSelectedPost(post);
  };

  if (!loaded || posts.length === 0) return null;

  const getMediaUrl = (post: Post) => {
    return post.thumbnailUrl || post.mediaUrls?.[0] || "";
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vox-green/30 to-vox-cyan/30 flex items-center justify-center">
            <Play className="w-4 h-4 text-vox-green" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Recent Posts</h2>
            <p className="text-[11px] text-vox-muted">Fresh from the community</p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {posts.map((post, i) => {
            const mediaUrl = getMediaUrl(post);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex-shrink-0 w-40 sm:w-44"
              >
                <button onClick={() => openPost(post)} className="w-full text-left touch-feedback">
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.04] group">
                    {mediaUrl ? (
                      post.type === "video" ? (
                        <video
                          src={mediaUrl}
                          muted
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaUrl}
                          alt={post.caption}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-vox-muted" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {post.type === "video" && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2">
                      <Link
                        href={`/profile/${post.authorUsername}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[1px] flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-[10px] text-white font-medium truncate">{post.authorName}</span>
                      </Link>
                    </div>

                    <div className="absolute top-2 left-2 flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-[9px] text-white font-medium bg-black/40 px-1.5 py-0.5 rounded-full">
                        <Heart className={`w-2.5 h-2.5 ${post.likedByMe ? "fill-vox-pink text-vox-pink" : ""}`} />
                        {formatCount(post.likes)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/80 mt-1.5 line-clamp-2 leading-tight">
                    {post.caption || "No caption"}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide glass-strong rounded-3xl"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white touch-feedback"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
                <Link href={`/profile/${selectedPost.authorUsername}`} onClick={() => setSelectedPost(null)}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[2px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedPost.authorAvatar} alt={selectedPost.authorName} className="w-full h-full rounded-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{selectedPost.authorName}</p>
                  <p className="text-[10px] text-vox-muted">{timeAgo(selectedPost.createdAt)}</p>
                </div>
              </div>

              <div className="relative bg-black/40">
                {getMediaUrl(selectedPost) ? (
                  selectedPost.type === "video" ? (
                    <video
                      src={getMediaUrl(selectedPost)}
                      controls
                      autoPlay
                      className="w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getMediaUrl(selectedPost)} alt={selectedPost.caption} className="w-full max-h-[400px] object-contain" />
                  )
                ) : (
                  <div className="w-full aspect-[9/16] flex items-center justify-center">
                    <Play className="w-8 h-8 text-vox-muted" />
                  </div>
                )}
              </div>

              {selectedPost.caption && (
                <div className="px-4 py-3">
                  <p className="text-sm text-white whitespace-pre-wrap">{selectedPost.caption}</p>
                  {selectedPost.hashtags && (
                    <p className="text-xs text-vox-cyan mt-1">{selectedPost.hashtags}</p>
                  )}
                </div>
              )}

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
                {selectedPost.allowDownload && (
                  <button onClick={() => handleDownload(selectedPost.id, selectedPost.mediaIds[0])} className="flex items-center gap-1.5 touch-feedback">
                    <Download className="w-5 h-5 text-white" />
                  </button>
                )}
                <button onClick={() => handleSave(selectedPost.id)} className="flex items-center gap-1.5 touch-feedback ml-auto">
                  <Bookmark className={`w-5 h-5 ${selectedPost.savedByMe ? "fill-vox-cyan text-vox-cyan" : "text-white"}`} />
                </button>
              </div>

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
