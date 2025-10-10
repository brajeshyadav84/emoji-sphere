import { useState } from "react";
import { Button } from "./ui/button";
import { List, Grid3X3, Zap } from "lucide-react";
import PostsFeed from "./PostsFeed";
import DetailedPostsFeed from "./DetailedPostsFeed";

interface PostsFeedSwitcherProps {
  className?: string;
}

type FeedType = "regular" | "optimized" | "detailed";

const PostsFeedSwitcher = ({ className = "" }: PostsFeedSwitcherProps) => {
  const [feedType, setFeedType] = useState<FeedType>("optimized");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Feed Content - Always show optimized feed */}
      <div className="min-h-[200px]">
        <PostsFeed 
          className="animate-in fade-in-50 duration-300" 
          useStoredProcedure={true}
        />
      </div>
    </div>
  );
};

export default PostsFeedSwitcher;