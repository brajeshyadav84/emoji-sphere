import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Smile, AlertTriangle } from "lucide-react";
import { validateContent, ContentValidationResult } from "@/utils/contentFilter";
import useSecurity from "@/hooks/useSecurity";
import SecurityNotice from "./SecurityNotice";
import { useToast } from "@/hooks/use-toast";
import { useCreatePostMutation } from "@/store/api/postsApi";
import { useShareGroupPostMutation } from "@/store/api/groupPostApi";
import { useParams } from "react-router-dom";

interface CreatePostProps {
  fromGroup?: boolean;
}

const CreatePost = ({ fromGroup }: CreatePostProps = {}) => {
  const { groupId } = useParams();
  const [postText, setPostText] = useState("");
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);
  const [validationMessage, setValidationMessage] = useState<ContentValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [createPost] = useCreatePostMutation();
  const [shareGroupPost, { isLoading: isPosting }] = useShareGroupPostMutation();

  // Apply security features
  useSecurity();

  const basicEmojis = ["😊", "❤️", "🎉", "⭐", "🌈", "🎨", "🎮", "🎵", "☀️", "✨", "🦄", "🌸"];
  const moreEmojis = ["🚀", "🎯", "🏆", "🎪", "🎭", "🎬", "📚", "🔥", "💫", "🌟", "🎊", "🎈", "🍰", "🎂", "🌺"];

  const addEmoji = (emoji: string) => {
    setPostText(postText + emoji);
    // Clear validation message when user interacts
    if (validationMessage && !validationMessage.isValid) {
      setValidationMessage(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    // Clear validation message when user types
    if (validationMessage && !validationMessage.isValid) {
      setValidationMessage(null);
    }
  };

  const handleShare = async () => {
    if (!postText.trim()) {
      setValidationMessage({
        isValid: false,
        message: "📝 Please write something before sharing!",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Validate content
    const validation = validateContent(postText);
    setValidationMessage(validation);
    
    if (!validation.isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (fromGroup) {
        // Use RTK Query to create post via backend API
        await shareGroupPost({
          content: postText,
          isPublic: true,
          groupId: Number(groupId), // Replace with actual groupId as needed
          // Add categoryId if needed
          // categoryId: 1,
          // Add tags if any emojis are detected
          tags: extractEmojisAsTags(postText),
        }).unwrap();
      } else {
        // Use RTK Query to create post via backend API
        await createPost({
          content: postText,
          isPublic: true,
          // Add categoryId if needed
          // categoryId: 1,
          // Add tags if any emojis are detected
          tags: extractEmojisAsTags(postText),
        }).unwrap();
      }

      // Success - clear form
      setPostText("");
      setValidationMessage({
        isValid: true,
        message: "🎉 Your post has been shared successfully!"
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setValidationMessage(null);
      }, 3000);
      
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });

    } catch (error: any) {
      console.error("Error creating post:", error);
      setValidationMessage({
        isValid: false,
        message: "❌ Failed to create post. Please try again."
      });
      
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // Helper function to extract emojis as tags
  const extractEmojisAsTags = (text: string): string[] => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];
    return [...new Set(emojis)]; // Remove duplicates
  };

  // Prevent copy-paste in textarea
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setValidationMessage({
      isValid: false,
      message: "📋 Copy-paste is not allowed. Please type your message!"
    });
    setTimeout(() => {
      setValidationMessage(null);
    }, 3000);
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <SecurityNotice />
      <Card className="p-3 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 mx-0 w-full max-w-full">
      <div className="flex items-start gap-2 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full gradient-primary flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
          😊
        </div>
        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="What's on your mind? Share something nice! 🌈"
            value={postText}
            onChange={handleTextChange}
            onPaste={handlePaste}
            onCopy={handleCopy}
            className="min-h-[80px] md:min-h-[100px] border-2 border-border focus:border-primary resize-none text-sm md:text-base"
          />
          
          {/* Validation Message */}
          {validationMessage && (
            <div className={`mt-2 p-2 md:p-3 rounded-lg text-xs md:text-sm flex items-start gap-2 ${
              validationMessage.isValid 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {!validationMessage.isValid && <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />}
              <span className="break-words">{validationMessage.message}</span>
            </div>
          )}
          
          <div className="mt-3 md:mt-4 space-y-2">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {basicEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-lg md:text-2xl hover:scale-125 transition-transform duration-200 p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {showMoreEmojis && (
              <div className="flex flex-wrap gap-1 md:gap-2 pt-2">
                {moreEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-lg md:text-2xl hover:scale-125 transition-transform duration-200 p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                onClick={() => setShowMoreEmojis(!showMoreEmojis)}
              >
                <Smile className="h-3 w-3 md:h-4 md:w-4" />
                {showMoreEmojis ? "Less Emojis" : "More Emojis"}
              </Button>
            </div>
            <Button 
              className="gradient-primary font-semibold text-xs md:text-sm px-3 md:px-4"
              onClick={handleShare}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share Post 🚀"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default CreatePost;
