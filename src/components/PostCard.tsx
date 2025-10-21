import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useParams } from "react-router-dom";
import { useGetUserGroupsQuery } from "@/store/api/groupsApi";
import { useDeletePostMutation } from "@/store/api/postsApi";
import { useDeleteGroupPostMutation, useGroupToggleLikePostMutation } from "@/store/api/groupPostApi";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Heart, MessageCircle, Share2, Send, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getAvatarByGender } from "@/utils/avatarUtils";

import { 
  useGetCommentsByPostQuery, 
  useCreateCommentMutation,
  useTogglePostLikeMutation,
  useToggleCommentLikeMutation 
} from "@/store/api/commentsApi";
import {
  useGetGroupCommentsByPostQuery,
  useCreateGroupCommentMutation,
  useToggleGroupCommentLikeMutation
} from "@/store/api/groupCommentApi";
import { skipToken } from "@reduxjs/toolkit/query";

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
  fromGroup?: boolean;
  onUpdate?: () => void;
  currentUserId?: string;
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
  fromGroup = false,
  onUpdate,
  currentUserId
}: PostCardProps) => {
  const [deletePost, { isLoading: isDeleting }] = fromGroup
    ? useDeleteGroupPostMutation()
    : useDeletePostMutation();
  const canDelete = currentUserId && userId && currentUserId == userId;
  
  // AlertDialog state for delete
  const [deleteTarget, setDeleteTarget] = useState<boolean>(false);

  const handleDelete = () => {
    setDeleteTarget(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePost(postId).unwrap();
      // Notify local UI that a post was deleted so parent lists can remove it without a full refetch
      try {
        window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
      } catch (err) {
        // ignore - some environments may not allow dispatching
      }

      toast({ title: "Post deleted", description: "Your post was deleted successfully." });
      // keep existing callback for backwards compatibility
      onUpdate?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    }
    setDeleteTarget(false);
  };
  
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

  // Auth and group membership
  const isAuthorized = useAppSelector((state) => state.auth.isAuthenticated);
  // Try to get groupId from route when PostCard is rendered on GroupPage
  const params = useParams<{ groupId?: string }>();
  const routeGroupId = params.groupId ? Number(params.groupId) : undefined;

  const { data: userGroupsData } = useGetUserGroupsQuery(fromGroup ? undefined : skipToken as any);
  const userGroups = userGroupsData?.data || [];

  // Determine if current user is member of the group where this post belongs.
  // If PostCard is used inside a group page, we infer groupId from route.
  const isUserMember = fromGroup && routeGroupId
    ? userGroups.some((g: any) => g.id === routeGroupId)
    : false;


  // API hooks
  const commentsApi = fromGroup
    ? useGetGroupCommentsByPostQuery({ postId, page: 0, size: 10 }, { skip: !showComments })
    : useGetCommentsByPostQuery({ postId, page: 0, size: 10 }, { skip: !showComments });

  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = commentsApi;

  // Normalize comments list: commentsData may be ApiResponse<CommentsResponse> or GroupCommentsResponse
  const commentsList = (() => {
    if (!commentsData) return [] as any[];
    // ApiResponse has 'data' property
    if ((commentsData as any).data && (commentsData as any).data.content) {
      return (commentsData as any).data.content;
    }
    // Otherwise assume it's already the paginated response
    return (commentsData as any).content || [];
  })();

  const [createComment] = fromGroup ? useCreateGroupCommentMutation() : useCreateCommentMutation();
  const [togglePostLike] = fromGroup ? useGroupToggleLikePostMutation() : useTogglePostLikeMutation();
  const [toggleCommentLike] = fromGroup ? useToggleGroupCommentLikeMutation() : useToggleCommentLikeMutation();

  const handleShare = async () => {
    // Guard: only allow sharing when authorized and membership rules satisfied
    if (fromGroup) {
      if (!isAuthorized || !isUserMember) {
        toast({ title: 'Unauthorized', description: 'You must be a member of this group and logged in to share posts.', variant: 'destructive' });
        return;
      }
    } else {
      if (!isAuthorized) {
        toast({ title: 'Unauthorized', description: 'You must be logged in to share posts.', variant: 'destructive' });
        return;
      }
    }
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
    // Guard: only allow liking when authorized and membership rules satisfied
    if (fromGroup) {
      if (!isAuthorized || !isUserMember) {
        toast({ title: 'Unauthorized', description: 'You must be a member of this group and logged in to like posts.', variant: 'destructive' });
        return;
      }
    } else {
      if (!isAuthorized) {
        toast({ title: 'Unauthorized', description: 'You must be logged in to like posts.', variant: 'destructive' });
        return;
      }
    }
    try {
      console.log('Attempting to like post:', postId);
      const result = await togglePostLike(postId).unwrap();
      console.log('Like API result:', result);

      // The backend returns ApiResponse<LikeResponse>
      let isNowLiked: boolean | undefined = undefined;
      if (result) {
        if ('data' in result && (result as any).data) {
          isNowLiked = (result as any).data?.liked;
        } else {
          isNowLiked = (result as any).liked;
        }
      }

      setLiked(isNowLiked ?? liked);
      setLikeCount(prev => (isNowLiked ? prev + 1 : prev - 1));
      onUpdate?.();

      const postMessage = result && ('data' in result && (result as any).data ? (result as any).data?.message : (result as any).message);
      toast({
        title: "Success",
        description: postMessage || `Post ${isNowLiked ? 'liked' : 'unliked'} successfully!`,
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
    // Guard: only allow comment like when authorized and membership rules satisfied
    if (fromGroup) {
      if (!isAuthorized || !isUserMember) {
        toast({ title: 'Unauthorized', description: 'You must be a member of this group and logged in to like comments.', variant: 'destructive' });
        return;
      }
    } else {
      if (!isAuthorized) {
        toast({ title: 'Unauthorized', description: 'You must be logged in to like comments.', variant: 'destructive' });
        return;
      }
    }
    try {
      const result = await toggleCommentLike(commentId).unwrap();
      console.log('Comment like result:', result);
      refetchComments();

      let likedFlag: boolean | undefined = undefined;
      let messageText: string | undefined = undefined;
      if (result) {
        if ('data' in result && (result as any).data) {
          likedFlag = (result as any).data?.liked;
          messageText = (result as any).data?.message;
        } else {
          likedFlag = (result as any).liked;
          messageText = (result as any).message;
        }
      }

      toast({
        title: "Success",
        description: messageText || `Comment ${likedFlag ? 'liked' : 'unliked'} successfully!`,
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
    // Guard: only allow commenting when authorized and membership rules satisfied
    if (fromGroup) {
      if (!isAuthorized || !isUserMember) {
        toast({ title: 'Unauthorized', description: 'You must be a member of this group and logged in to comment.', variant: 'destructive' });
        return;
      }
    } else {
      if (!isAuthorized) {
        toast({ title: 'Unauthorized', description: 'You must be logged in to comment.', variant: 'destructive' });
        return;
      }
    }
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
    // Guard: only allow reply when authorized and membership rules satisfied
    if (fromGroup) {
      if (!isAuthorized || !isUserMember) {
        toast({ title: 'Unauthorized', description: 'You must be a member of this group and logged in to reply.', variant: 'destructive' });
        return;
      }
    } else {
      if (!isAuthorized) {
        toast({ title: 'Unauthorized', description: 'You must be logged in to reply.', variant: 'destructive' });
        return;
      }
    }
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
    <Card className="p-3 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 mx-0 w-full max-w-full transform hover:scale-[1.02] hover:-translate-y-1">
      <div className="flex items-start gap-2 md:gap-4">
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl flex-shrink-0 bg-gradient-to-br from-orange-50 to-pink-50 border border-gray-200 shadow-sm cursor-pointer hover:scale-110 transition-all duration-200 hover:shadow-md"
          onClick={handleAvatarClick}
          title={`View ${author}'s profile`}
        >
          {getAvatarByGender(userGender)}
        </div>
  <div className="flex-1 min-w-0 relative">
          <div className="flex items-center gap-2 mb-2">
            {canDelete && (
              <button
                className="absolute right-0 top-0 text-red-500 hover:text-red-700 p-1"
                title="Delete post"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteTarget} onOpenChange={() => setDeleteTarget(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
            <h3 
              className="font-bold text-foreground text-sm md:text-base truncate cursor-pointer hover:text-primary transition-all duration-200 hover:scale-105"
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
              className={`gap-2 transition-all duration-200 hover:scale-110 ${liked ? "text-destructive" : "hover:text-destructive"}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-current animate-pulse" : ""}`} />
              <span className="font-semibold">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:text-primary transition-all duration-200 hover:scale-110"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">{comments}</span>
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 md:gap-2 hover:text-success transition-all duration-200 hover:scale-110 px-1 md:px-2 text-xs md:text-sm"
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
                {commentsList.map((comment) => (
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
