import { useState, useEffect } from "react";
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
  onUpdate?: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
  };
  comment_replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

const PostCard = ({ postId, author, avatar, time, content, likes, comments, onUpdate }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();

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
        profiles:user_id (name),
        comment_replies (
          id,
          content,
          created_at,
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
  return (
    <Card className="p-6 shadow-playful hover:shadow-hover transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 gradient-primary">
          {avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-foreground">{author}</h3>
            <span className="text-sm text-muted-foreground">• {time}</span>
          </div>
          <p className="text-base text-foreground mb-4 leading-relaxed">{content}</p>
          
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
            <Button variant="ghost" size="sm" className="gap-2 hover:text-success transition-colors">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        👤
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{comment.profiles?.name}</p>
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
                                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-xs">
                                    👤
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold">{reply.profiles?.name}</p>
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
