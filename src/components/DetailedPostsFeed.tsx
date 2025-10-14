import { useState, useEffect, useRef } from "react";
import { useGetPostsWithDetailsQuery } from "@/store/api/postsApi";
import { useTogglePostLikeMutation, useToggleCommentLikeMutation } from "@/store/api/commentsApi";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle, Heart, MessageCircle, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarByGender } from "@/utils/avatarUtils";
import { useToast } from "@/hooks/use-toast";

interface DetailedPostsFeedProps {
  className?: string;
}

// Custom hook for intersection observer
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Once in view, stop observing to keep the animation
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      rootMargin: '20px',
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isInView] as const;
};

const DetailedPostsFeed = ({ className = "" }: DetailedPostsFeedProps) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const { toast } = useToast();
  
  const {
    data: postsData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetPostsWithDetailsQuery({
    page,
    size,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const [togglePostLike] = useTogglePostLikeMutation();
  const [toggleCommentLike] = useToggleCommentLikeMutation();

  const handleRefresh = () => {
    setPage(0); // Reset to first page
    refetch();
  };

  const handleLoadMore = () => {
    if (postsData && !postsData.last) {
      setPage(prev => prev + 1);
    }
  };

  const handlePostLike = async (postId: number) => {
    try {
      const result = await togglePostLike(postId).unwrap();
      refetch(); // Refresh the data to get updated like counts
      toast({
        title: "Success",
        description: result.message || "Post like updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const result = await toggleCommentLike(commentId).unwrap();
      refetch(); // Refresh the data to get updated like counts
      toast({
        title: "Success",
        description: result.message || "Comment like updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment like. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-300 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">Error loading posts</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!postsData || postsData.content.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts available</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Detailed Posts Feed</h2>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Posts with animations */}
      <div className="space-y-6">
        {postsData.content.map((post, index) => (
          <DetailedPostCard
            key={post.postId}
            post={post}
            index={index}
            onPostLike={handlePostLike}
            onCommentLike={handleCommentLike}
          />
        ))}
      </div>

      {/* Load More Button */}
      {postsData && !postsData.last && (
        <div className="text-center py-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isFetching}
            className="transform transition-all duration-200 hover:scale-105"
          >
            {isFetching ? 'Loading...' : 'Load More Posts'}
          </Button>
        </div>
      )}

      {/* Posts Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {postsData.content.length} of {postsData.totalElements} posts
      </div>
    </div>
  );
};

// Component for individual detailed post with animation
const DetailedPostCard = ({ 
  post, 
  index, 
  onPostLike, 
  onCommentLike 
}: { 
  post: any; 
  index: number; 
  onPostLike: (postId: number) => void;
  onCommentLike: (commentId: number) => void;
}) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        isInView 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-12 opacity-0 scale-95'
      }`}
      style={{
        transitionDelay: `${Math.min(index * 150, 800)}ms`
      }}
    >
      <div className="hover:scale-[1.01] transition-transform duration-300 ease-out">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={getAvatarByGender(post.gender)} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.userName}</h3>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {post.country}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Post Content */}
            <div className="mb-4">
              <p className="text-base">{post.content}</p>
              {post.mediaUrl && (
                <img 
                  src={post.mediaUrl} 
                  alt="Post media" 
                  className="mt-3 rounded-lg max-w-full h-auto transform transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>

            {/* Post Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 hover:text-destructive transition-all duration-200 p-1 hover:scale-110"
                onClick={() => onPostLike(post.postId)}
              >
                <Heart className="h-4 w-4" />
                <span>{post.likeCount} likes</span>
              </Button>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount} comments
              </span>
            </div>

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Comments ({post.commentCount})</h4>
                <div className="space-y-3">
                  {post.comments.map((comment, commentIndex) => (
                    <div 
                      key={comment.commentId} 
                      className={`bg-gray-50 rounded-lg p-3 transform transition-all duration-500 ${
                        isInView ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      }`}
                      style={{
                        transitionDelay: `${(index * 150) + (commentIndex * 100)}ms`
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-base">{comment.commentedBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.commentCreatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-base">{comment.commentText}</p>
                          
                          {/* Comment Stats */}
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 hover:text-destructive transition-all duration-200 p-1 h-auto hover:scale-110"
                              onClick={() => onCommentLike(comment.commentId)}
                            >
                              <Heart className="h-3 w-3" />
                              <span>{comment.likeCount}</span>
                            </Button>
                            {comment.replies && comment.replies.length > 0 && (
                              <span className="text-muted-foreground">{comment.replies.length} replies</span>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {comment.replies.map((reply, replyIndex) => (
                                <div 
                                  key={reply.replyId} 
                                  className={`bg-white rounded p-2 ml-4 transform transition-all duration-300 ${
                                    isInView ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                                  }`}
                                  style={{
                                    transitionDelay: `${(index * 150) + (commentIndex * 100) + (replyIndex * 50)}ms`
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-base">{reply.repliedBy}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(reply.replyCreatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-base">{reply.replyText}</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailedPostsFeed;

export default DetailedPostsFeed;