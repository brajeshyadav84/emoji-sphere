import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

const YouTubeModal = ({ isOpen, onClose, videoId, title }: YouTubeModalProps) => {
  const getYouTubeEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',                    // Don't show related videos
      modestbranding: '1',         // Remove YouTube logo
      controls: '1',               // Show minimal player controls (play/pause/fullscreen)
      showinfo: '0',               // Hide video title and uploader info
      fs: '1',                     // Allow fullscreen
      cc_load_policy: '0',         // Don't show captions by default
      iv_load_policy: '3',         // Hide video annotations
      disablekb: '0',              // Allow keyboard controls (spacebar for play/pause)
      playsinline: '1',            // Play inline on mobile
      origin: window.location.origin, // For security
      enablejsapi: '1',            // Enable JavaScript API
      branding: '0',               // Hide YouTube branding (if supported)
      autohide: '1',               // Auto-hide controls after a few seconds
      color: 'white',              // Use white progress bar instead of red
      theme: 'light'               // Use light theme
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-background [&>button]:hidden">
        <DialogHeader className="p-4 pb-0 relative z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              📺 {title || "Educational Video"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-secondary relative z-20 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="aspect-video w-full bg-black/5 relative">
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            title={title || "Educational Video"}
            className="w-full h-full border-0 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            style={{ 
              pointerEvents: 'auto',
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
        
        <div className="p-4 bg-muted/20 border-t relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-2 relative z-20 shrink-0"
            >
              <X className="h-3 w-3" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeModal;