"use client";

import { useState, useEffect } from "react";
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
  subscribeToUserPosts,
  toggleLike,
  toggleSave,
  addComment,
  incrementShare,
  incrementView,
  deletePost,
  downloadFile,
  getFileURL,
  timeAgo,
  formatCount,
  type Post,
} from "@/lib/firebase-store";
import { useAuth } from "@/lib/auth-context";

/** Video player that loads video from IndexedDB (local) with thumbnail fallback */
function VideoPlayer({ post }: { post: Post }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const directUrl = post.mediaUrls?.[0];
    if (directUrl && (directUrl.startsWith("http://") || directUrl.startsWith("https://") || directUrl.startsWith("blob:"))) {
      setVideoUrl(directUrl);
      setLoading(false);
    } else if (post.mediaIds[0]) {
      getFileURL(post.mediaIds[0]).then((url) => {
        if (url) setVideoUrl(url);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [post.mediaIds, post.mediaUrls]);

  if (loading) {
    return (
      <div className="w-full aspect-[9/16] max-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-vox-purple/30 border-t-vox-purple animate-spin" />
      </div>
    );
  }

  if (videoUrl) {
    return <video src={videoUrl} controls autoPlay className="w-full max-h-[400px] object-contain" />;
  }

  return (
    <div className="relative w-full max-h-[400px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.thumbnailUrl || post.mediaUrls?.[0] || ""} alt={post.caption} className="w-full max-h-[400px] object-contain" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <div className="text-center">
          <Play className="w-12 h-12 text-white/80 mx-auto mb-2" />
          <p className="text-xs text-white/60">Video available on original device</p>
        </div>
      </div>
    </div>
  );
}

/** Image viewer that loads full image from IndexedDB with thumbnail fallback */
function ImageViewer({ post }: { post: Post }) {
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    const mediaId = post.mediaIds[0];
    if (mediaId) {
      getFileURL(mediaId).then((url) => {
        if (url) setFullUrl(url);
      }).catch(() => {});
    }
  }, [post.mediaIds]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={fullUrl || post.mediaUrls?.[0] || ""} alt={post.caption} className="w-full max-h-[400px] object-contain" />
  );
}

interface UserPostsGridProps {
  username: string;
  emptyMessage?: string;
}

export default function UserPostsGrid({ username, emptyMessage = "No posts yet" }: UserPostsGridProps) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Real-time subscription to user posts
  useEffect(() => {
    const unsubscribe = subscribeToUserPosts(username, (userPosts) => {
      setPosts(userPosts);
      setLoaded(true);
    });
    return () => unsubscribe();
  }, [username]);

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
      navigator.share({ title: "VOXel Post", text: "Check out this post on VOXel!", url: window.location.href }).catch(() => {});
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

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    setSelectedPost(null);
    setShowMenu(false);
  };

  const openPost = async (post: Post) => {
    await incrementView(post.id, currentUser?.email);
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
    if (!emptyMessage) return null;
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

  const getMediaUrl = (post: Post & { mediaUrls?: string[]; thumbnailUrl?: string }) => {
    return post.thumbnailUrl || post.mediaUrls?.[0] || "";
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {posts.map((post, i) => {
          const mediaUrl = getMediaUrl(post);
          return (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => openPost(post)}
              className="relative aspect-[9/16] rounded-xl overflow-hidden touch-feedback group cursor-pointer bg-white/[0.04]"
            >
              {mediaUrl ? (
                post.type === "video" ? (
                  <video src={mediaUrl} muted className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt={post.caption} className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-5 h-5 text-vox-muted" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {post.type === "video" && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              )}

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
          );
        })}
      </div>

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

              <div className="relative bg-black/40">
                {getMediaUrl(selectedPost) ? (
                  selectedPost.type === "video" ? (
                    <VideoPlayer post={selectedPost} />
                  ) : (
                    <ImageViewer post={selectedPost} />
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
