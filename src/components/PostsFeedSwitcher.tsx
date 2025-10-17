import { useState } from "react";
import { Button } from "./ui/button";
import { List, Grid3X3, Zap } from "lucide-react";
import PostsFeed from "./PostsFeed";
import GroupPostsFeed from "./GroupPostsFeed";

interface PostsFeedSwitcherProps {
  className?: string;
  fromGroup?: boolean;
}

type FeedType = "regular" | "optimized" | "detailed";

const PostsFeedSwitcher = ({ className = "", fromGroup }: PostsFeedSwitcherProps) => {
  const [feedType, setFeedType] = useState<FeedType>("optimized");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Feed Content - Always show optimized feed */}
      <div className="min-h-[200px]">
        {fromGroup ? (
          <GroupPostsFeed
            className="animate-in fade-in-50 duration-300"
            useStoredProcedure={true}
          />
        ) : (
          <PostsFeed
            className="animate-in fade-in-50 duration-300"
            useStoredProcedure={true}
          />
        )}
      </div>
    </div>
  );
};

export default PostsFeedSwitcher;