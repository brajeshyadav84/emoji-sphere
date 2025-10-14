import { useState, useEffect, useRef } from "react";
import { useGetPostsQuery } from "@/store/api/postsApi";
import PostCard from "./PostCard";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { getAvatarByGender } from "@/utils/avatarUtils";

interface PostsFeedProps {
  className?: string;
  useStoredProcedure?: boolean;
}

// Animation component for posts
const AnimatedPostCard = ({ 
  children, 
  index, 
  isVisible 
}: { 
  children: React.ReactNode; 
  index: number; 
  isVisible: boolean; 
}) => {
  return (
    <div
      className={`transform transition-all duration-700 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`
      }}
    >
      {children}
    </div>
  );
};

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

const PostsFeed = ({ className = "", useStoredProcedure = false }: PostsFeedProps) => {
  const [page, setPage] = useState(0);
  const [size] = useState(3);
  const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
  const [allPosts, setAllPosts] = useState<any[]>([]);
  
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
    useStoredProcedure,
  });

  // Accumulate posts as pages are loaded
  useEffect(() => {
    if (!postsData?.content) return;
    if (page === 0) {
      setAllPosts(postsData.content);
    } else {
      setAllPosts(prev => {
        // Avoid duplicates if API returns overlapping posts
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = postsData.content.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [postsData?.content, page]);

  // Function to mark post as visible
  const markPostAsVisible = (postId: number) => {
    setVisiblePosts(prev => new Set(prev).add(postId));
  };

  // Reset visible posts when data changes significantly
  useEffect(() => {
    if (page === 0) {
      setVisiblePosts(new Set());
    }
  }, [page, postsData?.content?.length]);

  const handleRefresh = () => {
  setPage(0); // Reset to first page
  setVisiblePosts(new Set()); // Reset animations
  setAllPosts([]); // Reset accumulated posts
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

  if (!allPosts || allPosts.length === 0) {
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

      {/* Posts with animations */}
      <div className="space-y-6">
        {allPosts.map((post, index) => {
          return (
            <PostWithAnimation
              key={post.id}
              post={post}
              index={index}
              onRefetch={refetch}
            />
          );
        })}
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
        Showing {allPosts.length} of {postsData?.totalElements ?? allPosts.length} posts
      </div>
    </div>
  );
};

// Component for individual post with animation
const PostWithAnimation = ({ 
  post, 
  index, 
  onRefetch 
}: { 
  post: any; 
  index: number; 
  onRefetch: () => void; 
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
      <div className="hover:scale-[1.02] transition-transform duration-300 ease-out">
        <PostCard
          postId={post.id}
          author={post.author.name}
          avatar={getAvatarByGender(post.author.gender)}
          time={new Date(post.createdAt).toLocaleDateString()}
          content={post.content}
          likes={post.likesCount}
          comments={post.commentsCount}
          userId={post.author.id.toString()}
          userGender={post.author.gender}
          isLikedByCurrentUser={post.isLikedByCurrentUser}
          onUpdate={onRefetch}
        />
      </div>
    </div>
  );
};

export default PostsFeed;