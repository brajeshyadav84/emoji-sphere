import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Lock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';

interface Meeting {
  meetingId: string;
  meetingName: string;
  zoomJoinUrl?: string;
  alternateUrl?: string;
  password?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isActive?: boolean;
}

const OnlineMeetingSimple = () => {
  // Hardcoded meeting data for testing
  const hardcodedMeetings = [
    {
      meetingId: "9900769545",
      meetingName: "Daily Learning Session",
      zoomJoinUrl: "https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987",
      alternateUrl: "https://app.zoom.us/wc/9900769545/start?omn=74633256987&fromPWA=1&pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
      password: "Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date
      scheduledTime: "10:00",
      isActive: true
    },
    {
      meetingId: "9900769546",
      meetingName: "English Practice Session",
      zoomJoinUrl: "https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987",
      password: "Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date
      scheduledTime: "14:00",
      isActive: true
    }
  ];
  
  const meetings = hardcodedMeetings;
  const isLoading = false;

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isMeetingAvailable = (meeting: Meeting) => {
    return meeting.isActive && isToday(meeting.scheduledDate || '');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    // For participants, redirect to the onlinemeeting page with meeting details
    const participantUrl = `${window.location.origin}/meeting-room?meetingId=${meeting.meetingId}&joinUrl=${encodeURIComponent(meeting.zoomJoinUrl || '')}&password=${encodeURIComponent(meeting.password || '')}`;
    window.location.href = participantUrl;
  };

  const todaysMeetings = meetings.filter((meeting: Meeting) => isToday(meeting.scheduledDate || ''));
  const otherMeetings = meetings.filter((meeting: Meeting) => !isToday(meeting.scheduledDate || ''));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Video className="h-8 w-8 text-blue-600" />
              Online Meetings
            </h1>
            <p className="text-gray-600 mt-2">Join today's scheduled meetings</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p>Loading meetings...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Today's Meetings */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Today's Meetings
                </h2>
                
                {todaysMeetings.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No meetings scheduled for today</h3>
                      <p className="text-gray-600">Check back later or contact your teacher</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {todaysMeetings.map((meeting: Meeting) => (
                      <Card 
                        key={meeting.meetingId} 
                        className={`${isMeetingAvailable(meeting) ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold">{meeting.meetingName}</h3>
                                {isMeetingAvailable(meeting) ? (
                                  <Badge className="bg-green-500">Available Now</Badge>
                                ) : (
                                  <Badge variant="secondary">Unavailable</Badge>
                                )}
                                {meeting.password && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Protected
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Meeting ID: {meeting.meetingId}
                                </p>
                                {meeting.scheduledTime && (
                                  <p className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Scheduled: {formatTime(meeting.scheduledTime)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleJoinMeeting(meeting)}
                                disabled={!isMeetingAvailable(meeting)}
                                className={`flex items-center gap-2 ${
                                  isMeetingAvailable(meeting) 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-gray-400'
                                }`}
                              >
                                <Users className="h-4 w-4" />
                                {isMeetingAvailable(meeting) ? 'Join Meeting' : 'Not Available'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Meetings (Disabled) */}
              {otherMeetings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-500">
                    <AlertCircle className="h-5 w-5" />
                    Upcoming/Past Meetings
                  </h2>
                  
                  <div className="grid gap-4">
                    {otherMeetings.map((meeting: Meeting) => (
                      <Card key={meeting.meetingId} className="border-gray-300 bg-gray-50 opacity-60">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-500">{meeting.meetingName}</h3>
                                <Badge variant="secondary">Not Available</Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-500">
                                <p className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Meeting ID: {meeting.meetingId}
                                </p>
                                {meeting.scheduledDate && (
                                  <p className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(meeting.scheduledDate).toLocaleDateString()}
                                    {meeting.scheduledTime && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {formatTime(meeting.scheduledTime)}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button disabled className="flex items-center gap-2 bg-gray-400">
                                <Users className="h-4 w-4" />
                                Not Available
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    How to Join Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">For Students:</h4>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>Only today's meetings are available to join</li>
                      <li>Future meetings will show as "Not Available"</li>
                      <li>Click "Join Meeting" when available</li>
                      <li>Make sure you have your camera and microphone ready</li>
                    </ul>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      If you can't see today's meeting, please contact your teacher or check back at the scheduled time.
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

export default OnlineMeetingSimple;