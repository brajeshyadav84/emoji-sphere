import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, Users, Settings } from 'lucide-react';
import Header from '@/components/Header';
import { useJoinOnlineMeetingMutation, useGetOnlineMeetingInfoQuery } from '@/store/api/zoomApi';

// Zoom SDK will be loaded dynamically to avoid initialization issues

const OnlineMeeting = () => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState(0); // 0 for participant, 1 for host
  const [password, setPassword] = useState('');
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [error, setError] = useState('');
  const [shouldFetchInfo, setShouldFetchInfo] = useState(false);
  const [zoomSDKLoaded, setZoomSDKLoaded] = useState(false);

  const meetingContainerRef = useRef(null);

  // RTK Query hooks
  const [joinOnlineMeeting, { isLoading: isJoining }] = useJoinOnlineMeetingMutation();
  const { data: meetingInfo, error: meetingInfoError, isLoading: isFetchingInfo } = useGetOnlineMeetingInfoQuery(
    meetingUrl,
    { 
      skip: !shouldFetchInfo || !meetingUrl || !meetingUrl.includes('zoom.us'),
      refetchOnMountOrArgChange: true
    }
  );

  // Initialize Zoom SDK safely
  const initializeZoomSDK = async () => {
    try {
      const { ZoomMtg } = await import('@zoom/meetingsdk');
      
      // Configure Zoom SDK
      ZoomMtg.setZoomJSLib('https://source.zoom.us/4.0.7/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      
      setZoomSDKLoaded(true);
      return ZoomMtg;
    } catch (error) {
      console.error('Failed to load Zoom SDK:', error);
      setError('Failed to load Zoom SDK. Please refresh the page.');
      return null;
    }
  };

  // Pre-fill with the provided URLs for testing
  useEffect(() => {
    const testUrls = [
      'https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987',
      'https://app.zoom.us/wc/9900769545/start?omn=74633256987&fromPWA=1&pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1'
    ];
    
    // Set first URL as default for testing
    setMeetingUrl(testUrls[0]);
    setShouldFetchInfo(true);
  }, []);

  // Handle meeting info response
  useEffect(() => {
    if (meetingInfo?.success) {
      setPassword(meetingInfo.password || '');
      setError('');
    } else if (meetingInfoError) {
      setError('Failed to extract meeting information');
    }
  }, [meetingInfo, meetingInfoError]);

  const handleMeetingUrlChange = (e) => {
    const url = e.target.value;
    setMeetingUrl(url);
    
    if (url.includes('zoom.us')) {
      setShouldFetchInfo(true);
    } else {
      setShouldFetchInfo(false);
      setPassword('');
    }
  };

  const joinMeeting = async () => {
    if (!meetingUrl || !userName) {
      setError('Please provide meeting URL and your name');
      return;
    }

    setError('');

    try {
      // Load Zoom SDK if not already loaded
      const ZoomMtg = await initializeZoomSDK();
      if (!ZoomMtg) {
        return; // Error already set in initializeZoomSDK
      }

      const result = await joinOnlineMeeting({
        meetingUrl,
        userName,
        userEmail,
        role,
        password
      }).unwrap();

      if (result.success) {
        // Initialize Zoom meeting
        ZoomMtg.init({
          leaveUrl: window.location.origin + '/onlinemeeting',
          success: (success) => {
            console.log('Zoom SDK initialized successfully', success);
            
            ZoomMtg.join({
              signature: result.signature,
              sdkKey: result.sdkKey,
              meetingNumber: result.meetingNumber,
              passWord: result.password,
              userName: result.userName,
              userEmail: result.userEmail,
              tk: '',
              zak: '',
              success: (success) => {
                console.log('Joined meeting successfully', success);
                setIsInMeeting(true);
              },
              error: (error) => {
                console.error('Failed to join meeting', error);
                setError('Failed to join meeting: ' + error.reason);
              }
            });
          },
          error: (error) => {
            console.error('Failed to initialize Zoom SDK', error);
            setError('Failed to initialize Zoom SDK: ' + error.reason);
          }
        });
      } else {
        setError(result.error || 'Failed to join meeting');
      }
    } catch (err) {
      console.error('Join meeting error:', err);
      setError(err?.data?.error || err?.message || 'Failed to join meeting');
    }
  };

  const leaveMeeting = async () => {
    try {
      const { ZoomMtg } = await import('@zoom/meetingsdk');
      ZoomMtg.leave({
        success: () => {
          setIsInMeeting(false);
          console.log('Left meeting successfully');
        },
        error: (error) => {
          console.error('Failed to leave meeting', error);
          // Force leave anyway
          setIsInMeeting(false);
        }
      });
    } catch (error) {
      console.error('Failed to load Zoom SDK for leaving:', error);
      // Force leave anyway
      setIsInMeeting(false);
    }
  };

  if (isInMeeting) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Online Meeting</h1>
            <Button onClick={leaveMeeting} variant="destructive">
              Leave Meeting
            </Button>
          </div>
          <div 
            id="zmmtg-root" 
            ref={meetingContainerRef}
            className="w-full h-screen"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                Join Online Meeting
              </CardTitle>
              <CardDescription>
                Enter your meeting details to join the Zoom meeting within our app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  placeholder="Enter Zoom meeting URL"
                  value={meetingUrl}
                  onChange={handleMeetingUrlChange}
                />
                {meetingInfo?.success && (
                  <p className="text-sm text-green-600">
                    ✓ Meeting ID: {meetingInfo.meetingNumber}
                  </p>
                )}
                {isFetchingInfo && (
                  <p className="text-sm text-blue-600">
                    🔄 Extracting meeting info...
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email (Optional)</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Meeting Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Meeting password (auto-filled from URL)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Join as</Label>
                <div className="flex gap-4">
                  <Button
                    variant={role === 0 ? "default" : "outline"}
                    onClick={() => setRole(0)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Participant
                  </Button>
                  <Button
                    variant={role === 1 ? "default" : "outline"}
                    onClick={() => setRole(1)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Host
                  </Button>
                </div>
              </div>

              <Button
                onClick={joinMeeting}
                disabled={isJoining || !meetingUrl || !userName}
                className="w-full"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Meeting...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Join Meeting
                  </>
                )}
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Test URLs:</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">
                    <strong>URL 1:</strong> https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987
                  </p>
                  <p className="text-blue-700">
                    <strong>URL 2:</strong> https://app.zoom.us/wc/9900769545/start?omn=74633256987&fromPWA=1&pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnlineMeeting;