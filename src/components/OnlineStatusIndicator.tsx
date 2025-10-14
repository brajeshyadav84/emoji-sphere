import React from 'react';
import { cn } from '@/lib/utils';

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  lastSeen?: string;
}

const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  isOnline,
  size = 'md',
  showText = false,
  className,
  lastSeen
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const formatLastSeen = (lastSeenDate: string) => {
    const now = new Date();
    const lastSeenTime = new Date(lastSeenDate);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  if (showText) {
    return (
      <div className={cn("flex items-center gap-1 text-xs", className)}>
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full border-2 border-background",
            isOnline 
              ? "bg-green-500 animate-pulse" 
              : "bg-gray-400"
          )}
        />
        <span className={cn(
          isOnline ? "text-green-600 dark:text-green-400" : "text-gray-500"
        )}>
          {isOnline ? "Online" : lastSeen ? formatLastSeen(lastSeen) : "Offline"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full border-2 border-background",
        isOnline 
          ? "bg-green-500 animate-pulse" 
          : "bg-gray-400",
        className
      )}
      title={
        isOnline 
          ? "Online" 
          : lastSeen 
            ? `Last seen ${formatLastSeen(lastSeen)}`
            : "Offline"
      }
    />
  );
};

export default OnlineStatusIndicator;