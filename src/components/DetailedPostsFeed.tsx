import { useState } from "react";
import { useGetPostsWithDetailsQuery } from "@/store/api/postsApi";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle, Heart, MessageCircle, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarByGender } from "@/utils/avatarUtils";

interface DetailedPostsFeedProps {
  className?: string;
}

const DetailedPostsFeed = ({ className = "" }: DetailedPostsFeedProps) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  
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

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (postsData && !postsData.last) {
      setPage(prev => prev + 1);
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

      {/* Posts */}
      {postsData.content.map((post) => (
        <Card key={post.postId} className="w-full">
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
                  className="mt-3 rounded-lg max-w-full h-auto"
                />
              )}
            </div>

            {/* Post Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount} comments
              </span>
            </div>

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Comments ({post.commentCount})</h4>
                <div className="space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.commentId} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.commentedBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.commentCreatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.commentText}</p>
                          
                          {/* Comment Stats */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {comment.likeCount}
                            </span>
                            {comment.replies && comment.replies.length > 0 && (
                              <span>{comment.replies.length} replies</span>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.replyId} className="bg-white rounded p-2 ml-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs">{reply.repliedBy}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(reply.replyCreatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.replyText}</p>
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
      ))}

      {/* Load More Button */}
      {postsData && !postsData.last && (
        <div className="text-center py-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isFetching}
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

export default DetailedPostsFeed;