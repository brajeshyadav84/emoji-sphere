import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
}

const PostCard = ({ author, avatar, time, content, likes, comments }: PostCardProps) => {
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
            <Button variant="ghost" size="sm" className="gap-2 hover:text-destructive transition-colors">
              <Heart className="h-4 w-4" />
              <span className="font-semibold">{likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">{comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-success transition-colors">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
