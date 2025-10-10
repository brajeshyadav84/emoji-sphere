import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvatarByGender } from "@/utils/avatarUtils";
import { 
  useGetCommentsByPostQuery, 
  useCreateCommentMutation,
  useTogglePostLikeMutation,
  useToggleCommentLikeMutation 
} from "@/store/api/commentsApi";

interface PostCardProps {
  postId: number; // Changed from string to number
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  userId?: string;
  userGender?: string; // Add gender prop
  isLikedByCurrentUser?: boolean; // Add this prop
  onUpdate?: () => void;
}

// Update the Comment interface to match backend response
interface Comment {
  id: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  parentCommentId: number | null;
  user: {
    id: string;
    fullName: string;
    name: string;
    mobile: string;
    email: string;
    age: number;
    country: string;
    gender?: string; // Add gender field
    // gender: string; // Removed, as it does not exist on UserResponse
    isVerified: boolean;
    role: string;
    createdAt: string;
  };
  replies: Reply[];
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

interface Reply {
  id: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  parentCommentId: number;
  user: {
    id: string;
    fullName: string;
    name: string;
    mobile: string;
    email: string;
    age: number;
    country: string;
    gender?: string; // Add gender field
    isVerified: boolean;
    role: string;
    createdAt: string;
  };
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

const PostCard = ({ 
  postId, 
  author, 
  avatar, 
  time, 
  content, 
  likes, 
  comments, 
  userId, 
  userGender, // Add gender prop
  isLikedByCurrentUser = false,
  onUpdate 
}: PostCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";

  // API hooks
  const { 
    data: commentsData, 
    isLoading: commentsLoading,
    refetch: refetchComments 
  } = useGetCommentsByPostQuery(
    { postId, page: 0, size: 10 }, 
    { skip: !showComments }
  );
  
  const [createComment] = useCreateCommentMutation();
  const [togglePostLike] = useTogglePostLikeMutation();
  const [toggleCommentLike] = useToggleCommentLikeMutation();

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
    setLiked(isLikedByCurrentUser);
    setLikeCount(likes);
  }, [isLikedByCurrentUser, likes]);

  const handleLike = async () => {
    try {
      console.log('Attempting to like post:', postId);
      const result = await togglePostLike(postId).unwrap();
      console.log('Like API result:', result);
      
      // The backend now returns {liked: boolean, status: string, message: string}
      const isNowLiked = result.liked;
      setLiked(isNowLiked);
      setLikeCount(prev => isNowLiked ? prev + 1 : prev - 1);
      onUpdate?.();
      
      toast({
        title: "Success",
        description: result.message || `Post ${isNowLiked ? 'liked' : 'unliked'} successfully!`,
      });
    } catch (error) {
      console.error('Like API error:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const result = await toggleCommentLike(commentId).unwrap();
      console.log('Comment like result:', result);
      refetchComments();
      
      toast({
        title: "Success",
        description: result.message || `Comment ${result.liked ? 'liked' : 'unliked'} successfully!`,
      });
    } catch (error) {
      console.error('Comment like error:', error);
      toast({
        title: "Error",
        description: "Failed to update comment like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment({
        postId,
        data: {
          content: newComment.trim(),
          parentCommentId: replyTo || undefined,
        }
      }).unwrap();

      setNewComment("");
      setReplyTo(null);
      refetchComments();
      onUpdate?.();
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (commentId: number) => {
    if (!replyContent.trim()) return;

    try {
      await createComment({
        postId,
        data: {
          content: replyContent.trim(),
          parentCommentId: commentId,
        }
      }).unwrap();

      setReplyContent("");
      setReplyTo(null);
      refetchComments();
      
      toast({
        title: "Success",
        description: "Reply added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
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
          {getAvatarByGender(userGender)}
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

              {commentsLoading && (
                <div className="text-center text-muted-foreground">Loading comments...</div>
              )}

              <div className="space-y-3">
                {commentsData?.content?.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 shadow-sm flex items-center justify-center text-sm cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => comment.user?.id && navigate(`/user/${comment.user.id}`)}
                        title={`View ${comment.user?.name}'s profile`}
                      >
                        {getAvatarByGender(comment.user?.gender)}
                      </div>
                      <div className="flex-1">
                        <p 
                          className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
                          onClick={() => comment.user?.id && navigate(`/user/${comment.user.id}`)}
                          title={`View ${comment.user?.name}'s profile`}
                        >
                          {comment.user?.name}
                        </p>
                        <p className="text-sm md:text-base text-foreground">{comment.commentText}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs gap-1 transition-colors ${comment.isLikedByCurrentUser ? "text-destructive" : "hover:text-destructive"}`}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            <Heart className={`h-3 w-3 ${comment.isLikedByCurrentUser ? "fill-current" : ""}`} />
                            <span>{comment.likesCount}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setReplyTo(comment.id)}
                          >
                            Reply
                          </Button>
                        </div>

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

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-4 mt-2 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-background/50 rounded-lg p-2">
                                <div className="flex items-start gap-2">
                                  <div 
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-green-50 to-yellow-50 border border-gray-200 shadow-sm flex items-center justify-center text-xs cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => reply.user?.id && navigate(`/user/${reply.user.id}`)}
                                    title={`View ${reply.user?.name}'s profile`}
                                  >
                                    {getAvatarByGender(reply.user?.gender)}
                                  </div>
                                  <div className="flex-1">
                                    <p 
                                      className="text-sm md:text-base font-semibold cursor-pointer hover:text-primary transition-colors"
                                      onClick={() => reply.user?.id && navigate(`/user/${reply.user.id}`)}
                                      title={`View ${reply.user?.name}'s profile`}
                                    >
                                      {reply.user?.name}
                                    </p>
                                    <p className="text-sm md:text-base text-foreground">{reply.commentText}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-xs gap-1 transition-colors ${reply.isLikedByCurrentUser ? "text-destructive" : "hover:text-destructive"}`}
                                        onClick={() => handleCommentLike(reply.id)}
                                      >
                                        <Heart className={`h-3 w-3 ${reply.isLikedByCurrentUser ? "fill-current" : ""}`} />
                                        <span>{reply.likesCount}</span>
                                      </Button>
                                    </div>
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
