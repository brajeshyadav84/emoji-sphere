import { useState } from "react";
import { useGetPostsQuery } from "@/store/api/postsApi";
import PostCard from "./PostCard";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { getAvatarByGender } from "@/utils/avatarUtils";

interface PostsFeedProps {
  className?: string;
}

const PostsFeed = ({ className = "" }: PostsFeedProps) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  
  const {
    data: postsData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetPostsQuery({
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
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-card p-6 rounded-2xl shadow-playful">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to load posts</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the posts. Please try again.
        </p>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!postsData?.content || postsData.content.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-4">
          Be the first to share something amazing!
        </p>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
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
        <h2 className="text-xl font-bold">Latest Posts</h2>
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
        <PostCard
          key={post.id}
          postId={post.id.toString()}
          author={post.author.name}
          avatar={getAvatarByGender(post.author.gender)}
          time={new Date(post.createdAt).toLocaleDateString()}
          content={post.content}
          likes={post.likesCount}
          comments={post.commentsCount}
          userId={post.author.id.toString()}
          onUpdate={refetch}
        />
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

export default PostsFeed;