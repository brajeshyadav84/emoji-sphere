import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const HomeworkHelper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if component should be shown (every 3 hours)
    const checkShowComponent = () => {
      const lastShown = localStorage.getItem('homeworkHelperLastShown');
      const now = new Date().getTime();
      const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

      if (!lastShown || now - parseInt(lastShown) >= threeHours) {
        setIsVisible(true);
      }
    };

    // Show immediately on first load, then check every minute
    checkShowComponent();
    const interval = setInterval(checkShowComponent, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSureClick = () => {
    // Store timestamp and navigate to ask-me
    localStorage.setItem('homeworkHelperLastShown', new Date().getTime().toString());
    setIsVisible(false);
    navigate('/ask-me');
  };

  const handleNoThanksClick = () => {
    // Store timestamp and hide component
    localStorage.setItem('homeworkHelperLastShown', new Date().getTime().toString());
    setIsVisible(false);
  };

  const handleClose = () => {
    // Just hide without storing timestamp (will show again on next check)
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-5 duration-500">
      <Card className="max-w-sm bg-white shadow-lg border-2 border-blue-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Close button */}
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Character and message */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex items-start gap-4">
              {/* Cartoon character */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  {/* Simple cartoon face */}
                  <div className="text-2xl">
                    <div className="relative">
                      {/* Face */}
                      <div className="w-12 h-12 bg-yellow-200 rounded-full relative">
                        {/* Eyes */}
                        <div className="absolute top-3 left-2 w-2 h-2 bg-black rounded-full"></div>
                        <div className="absolute top-3 right-2 w-2 h-2 bg-black rounded-full"></div>
                        {/* Smile */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 border-b-2 border-black rounded-full"></div>
                      </div>
                      {/* Hair */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-amber-600 rounded-t-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message bubble */}
              <div className="flex-1">
                <div className="bg-blue-50 rounded-lg p-4 relative">
                  {/* Speech bubble tail */}
                  <div className="absolute left-0 top-4 transform -translate-x-1 w-0 h-0 border-t-4 border-t-transparent border-r-8 border-r-blue-50 border-b-4 border-b-transparent"></div>
                  
                  <p className="text-gray-800 text-sm font-medium leading-relaxed">
                    Hi friend! Hope I didn't startle you. Have you finished your homework or need my help? 📚
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleSureClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sure!
                  </Button>
                  <Button 
                    onClick={handleNoThanksClick}
                    variant="outline"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    No thanks
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeworkHelper;