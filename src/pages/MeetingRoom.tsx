import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  ExternalLink, 
  Copy, 
  ArrowLeft,
  Shield,
  Clock,
  Users,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';

const MeetingRoom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);

  const meetingId = searchParams.get('meetingId');
  const joinUrl = searchParams.get('joinUrl');
  const password = searchParams.get('password');

  useEffect(() => {
    // Auto-start the meeting after component loads
    if (joinUrl && meetingId) {
      const timer = setTimeout(() => {
        setMeetingStarted(true);
      }, 1000); // 1 second delay to show the information

      return () => clearTimeout(timer);
    }
  }, [joinUrl, meetingId]);

  const getZoomWebClientUrl = () => {
    if (!joinUrl) return '';
    
    // For better compatibility, let's use the original Zoom URL
    // and let Zoom handle the web client redirection
    return decodeURIComponent(joinUrl);
  };

  const handleStartMeeting = () => {
    // Show the meeting options instead of embedding
    setMeetingStarted(true);
  };

  const handleJoinZoomApp = () => {
    // This will open Zoom desktop app if installed
    const zoomAppUrl = `zoommtg://zoom.us/join?confno=${meetingId}&pwd=${password}`;
    window.location.href = zoomAppUrl;
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      window.open(decodeURIComponent(joinUrl), '_blank');
    }, 1000);
  };

  const handleJoinWebBrowser = () => {
    // Force web version
    const webUrl = decodeURIComponent(joinUrl).replace('zoom.us/j/', 'zoom.us/wc/join/');
    window.open(webUrl, '_blank');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenInNewTab = () => {
    if (joinUrl) {
      window.open(decodeURIComponent(joinUrl), '_blank');
    }
  };

  const handleCopyMeetingInfo = () => {
    const meetingInfo = `
Meeting ID: ${meetingId}
Join URL: ${joinUrl ? decodeURIComponent(joinUrl) : 'Not available'}
Password: ${password || 'Not required'}
    `.trim();

    navigator.clipboard.writeText(meetingInfo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleManualJoin = () => {
    if (joinUrl) {
      window.open(decodeURIComponent(joinUrl), '_blank');
    }
  };

  const handleBackToMeetings = () => {
    navigate('/onlineclasses');
  };

  if (!meetingId || !joinUrl) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-6">
          <div className="max-w-2xl mx-auto">
            <Alert className="border-red-500 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Invalid meeting link. Please go back and try again.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={handleBackToMeetings} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Meetings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {!isFullscreen && <Header />}
      
      <div className={`${isFullscreen ? 'h-full' : 'container mx-auto py-6'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'max-w-6xl mx-auto'}`}>
          
          {/* Meeting Controls - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="mb-6">
              <Button 
                onClick={handleBackToMeetings} 
                variant="outline" 
                className="flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Meetings
              </Button>
              
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Video className="h-8 w-8 text-blue-600" />
                    Meeting Room
                  </h1>
                  <p className="text-gray-600 mt-2">Meeting ID: {meetingId}</p>
                </div>
                
                <div className="flex gap-2">
                  {meetingStarted && (
                    <Button 
                      onClick={handleToggleFullscreen}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Fullscreen
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Controls */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button 
                onClick={handleToggleFullscreen}
                variant="outline"
                size="sm"
                className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
              >
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </Button>
              <Button 
                onClick={handleBackToMeetings}
                variant="outline" 
                size="sm"
                className="bg-black/50 text-white border-gray-600 hover:bg-black/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Leave Meeting
              </Button>
            </div>
          )}

          {/* Meeting Interface */}
          {meetingStarted ? (
            <div className={`${isFullscreen ? 'h-full' : 'min-h-[600px]'} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative flex items-center justify-center`}>
              <div className="text-center max-w-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <Video className="h-16 w-16 mx-auto mb-6 text-blue-600" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Ready to Join Meeting</h2>
                  <p className="text-gray-600 mb-6">Choose how you'd like to join the meeting:</p>
                  
                  <div className="space-y-4">
                    {/* Zoom App Option */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h3 className="font-semibold text-blue-900">Zoom Desktop App</h3>
                          <p className="text-sm text-blue-700">Best experience with full features</p>
                        </div>
                        <Button 
                          onClick={handleJoinZoomApp}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Open App
                        </Button>
                      </div>
                    </div>
                    
                    {/* Web Browser Option */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h3 className="font-semibold text-green-900">Web Browser</h3>
                          <p className="text-sm text-green-700">Join directly in your browser</p>
                        </div>
                        <Button 
                          onClick={handleJoinWebBrowser}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Web
                        </Button>
                      </div>
                    </div>
                    
                    {/* Direct URL Option */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Meeting Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Meeting ID:</span>
                            <span className="font-mono bg-gray-200 px-2 py-1 rounded">{meetingId}</span>
                          </div>
                          {password && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Password:</span>
                              <span className="font-mono bg-gray-200 px-2 py-1 rounded">{password}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button 
                            onClick={handleCopyMeetingInfo}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            {copied ? 'Copied!' : 'Copy Info'}
                          </Button>
                          <Button 
                            onClick={handleOpenInNewTab}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Direct Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-medium text-yellow-800 mb-1">Having trouble joining?</h4>
                        <p className="text-sm text-yellow-700">
                          If the app doesn't open automatically, try the web browser option or use the meeting ID to join manually.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Pre-meeting Interface */
            <div className="grid gap-6 md:grid-cols-2">
              {/* Meeting Details */}
              <Card className="border-blue-500 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-600" />
                    Meeting Details
                    <Badge className="bg-green-500">Ready to Join</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">Meeting ID:</span>
                      <span className="font-mono bg-gray-200 px-2 py-1 rounded">{meetingId}</span>
                    </div>
                    
                    {password && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">Password:</span>
                        <span className="font-mono bg-gray-200 px-2 py-1 rounded">{password}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">Status:</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Ready to join
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button 
                      onClick={handleStartMeeting} 
                      className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Video className="h-5 w-5" />
                      Join Meeting Now
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCopyMeetingInfo}
                        variant="outline"
                        className="flex-1 flex items-center gap-2"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy Info'}
                      </Button>
                      
                      <Button 
                        onClick={handleOpenInNewTab}
                        variant="outline"
                        className="flex-1 flex items-center gap-2"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        New Tab
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Before You Join</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Technical Setup:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                      <li>Test your camera and microphone</li>
                      <li>Ensure stable internet connection</li>
                      <li>Use headphones to reduce echo</li>
                      <li>Close unnecessary applications</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Meeting Etiquette:</h4>
                    <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                      <li>Join with microphone muted</li>
                      <li>Use chat for questions</li>
                      <li>Raise hand to speak</li>
                      <li>Find a quiet, well-lit space</li>
                    </ul>
                  </div>
                  
                  <Alert>
                    <Video className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Embedded Meeting:</strong> The meeting will load directly in this page. 
                      You can use fullscreen mode for better experience.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;