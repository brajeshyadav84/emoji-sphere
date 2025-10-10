import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  postId: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  userId?: string; // Add userId prop
  onUpdate?: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string; // Add user_id
  profiles: {
    name: string;
  };
  comment_replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string; // Add user_id
  profiles: {
    name: string;
  };
}

const PostCard = ({ postId, author, avatar, time, content, likes, comments, userId, onUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";

  const handleShare = async () => {
    const shareData = {
      title: `${author} on KidSpace` ,
      text: content,
      url: postUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or error
      }
    } else {
      setShowShareMenu((v) => !v);
    }
  };

  useEffect(() => {
    checkIfLiked();
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    setLiked(!!data);
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (liked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (!error) {
        setLiked(false);
        setLikeCount(likeCount - 1);
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setLiked(true);
        setLikeCount(likeCount + 1);
      }
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("post_comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (name),
        comment_replies (
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (name)
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCommentsList(data as any);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      onUpdate?.();
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to reply",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("comment_replies")
      .insert({
        comment_id: commentId,
        user_id: user.id,
        content: replyContent,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    } else {
      setReplyContent("");
      setReplyTo(null);
      fetchComments();
    }
  };

  const handleAvatarClick = () => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };
  
  return (
    <Card className="p-3 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 mx-0 w-full max-w-full">
      <div className="flex items-start gap-2 md:gap-4">
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl flex-shrink-0 bg-gradient-to-br from-orange-50 to-pink-50 border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          onClick={handleAvatarClick}
          title={`View ${author}'s profile`}
        >
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="font-bold text-foreground text-sm md:text-base truncate cursor-pointer hover:text-primary transition-colors"
              onClick={handleAvatarClick}
              title={`View ${author}'s profile`}
            >
              {author}
            </h3>
            <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">• {time}</span>
          </div>
          <p className="text-sm md:text-base text-foreground mb-3 md:mb-4 leading-relaxed break-words">{content}</p>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 transition-colors ${liked ? "text-destructive" : "hover:text-destructive"}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span className="font-semibold">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:text-primary transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">{comments}</span>
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 md:gap-2 hover:text-success transition-colors px-1 md:px-2 text-xs md:text-sm"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              {showShareMenu && !isMobile && (
                <div className="absolute z-10 bg-background border rounded shadow-md p-2 mt-2 right-0 min-w-[180px] flex flex-col gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(content + '\n' + postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-green-600"
                  >
                    Share to WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    Share to Facebook
                  </a>
                  <a
                    href={`mailto:?subject=Check this post on KidSpace!&body=${encodeURIComponent(content + '\n' + postUrl)}`}
                    className="hover:underline text-gray-700"
                  >
                    Share via Email
                  </a>
                  <button
                    className="text-xs text-muted-foreground mt-1 hover:underline"
                    onClick={() => setShowShareMenu(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>

          {showComments && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <Button size="sm" onClick={handleAddComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {commentsList.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 shadow-sm flex items-center justify-center text-sm cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => comment.user_id && navigate(`/user/${comment.user_id}`)}
                        title={`View ${comment.profiles?.name}'s profile`}
                      >
                        👤
                      </div>
                      <div className="flex-1">
                        <p 
                          className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
                          onClick={() => comment.user_id && navigate(`/user/${comment.user_id}`)}
                          title={`View ${comment.profiles?.name}'s profile`}
                        >
                          {comment.profiles?.name}
                        </p>
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs mt-1"
                          onClick={() => setReplyTo(comment.id)}
                        >
                          Reply
                        </Button>

                        {replyTo === comment.id && (
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddReply(comment.id)}
                              className="text-sm"
                            />
                            <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {comment.comment_replies && comment.comment_replies.length > 0 && (
                          <div className="ml-4 mt-2 space-y-2">
                            {comment.comment_replies.map((reply) => (
                              <div key={reply.id} className="bg-background/50 rounded-lg p-2">
                                <div className="flex items-start gap-2">
                                  <div 
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-green-50 to-yellow-50 border border-gray-200 shadow-sm flex items-center justify-center text-xs cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => reply.user_id && navigate(`/user/${reply.user_id}`)}
                                    title={`View ${reply.profiles?.name}'s profile`}
                                  >
                                    👤
                                  </div>
                                  <div className="flex-1">
                                    <p 
                                      className="text-xs font-semibold cursor-pointer hover:text-primary transition-colors"
                                      onClick={() => reply.user_id && navigate(`/user/${reply.user_id}`)}
                                      title={`View ${reply.profiles?.name}'s profile`}
                                    >
                                      {reply.profiles?.name}
                                    </p>
                                    <p className="text-xs text-foreground">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
