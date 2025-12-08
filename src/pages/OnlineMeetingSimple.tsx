import React, { useState, useMemo } from 'react';
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
  CheckCircle,
  Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import { useGetPublicMeetingsQuery } from '@/store/api/teacherMeetingsApi';
import { useAppSelector } from '@/store/hooks';

interface Meeting {
  meetingId: string;
  meetingName: string;
  subjectDescription?: string;
  zoomJoinUrl?: string;
  alternateUrl?: string;
  password?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isActive?: boolean;
}

const OnlineMeetingSimple = () => {
  // Check authentication status
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Fetch public meetings from API - available to all users
  const { data: meetingsResponse, isLoading, error } = useGetPublicMeetingsQuery();

  // Transform API data to Meeting format
  const meetings = useMemo(() => {
    if (!meetingsResponse?.data) return [];

    return meetingsResponse.data.map((meeting) => ({
      meetingId: meeting.meetingId,
      meetingName: meeting.subjectTitle,
      subjectDescription: meeting.subjectDescription,
      zoomJoinUrl: meeting.meetingUrl,
      password: meeting.passcode,
      scheduledDate: new Date(meeting.startTime).toISOString().split('T')[0],
      scheduledTime: new Date(meeting.startTime).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      isActive: meeting.status === 'upcoming' || meeting.status === 'live',
      status: meeting.status
    }));
  }, [meetingsResponse]);

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    const meetingDate = new Date(dateString);

    // Compare year, month, and day
    return today.getFullYear() === meetingDate.getFullYear() &&
      today.getMonth() === meetingDate.getMonth() &&
      today.getDate() === meetingDate.getDate();
  };

  const isFutureDate = (dateString: string) => {
    if (!dateString) return false;
    const meetingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  };

  const isUpcoming = (dateString: string) => {
    if (!dateString) return false;

    // Don't show today's classes in upcoming - only future dates
    if (isToday(dateString)) return false;

    const meetingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate > today;
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
    // For participants, redirect to the meeting room page with meeting details
    const participantUrl = `${window.location.origin}/meeting-room?meetingId=${meeting.meetingId}&joinUrl=${encodeURIComponent(meeting.zoomJoinUrl || '')}&password=${encodeURIComponent(meeting.password || '')}`;
    window.location.href = participantUrl;
  };

  console.log('Meetings:::::', meetings);

  // Filter to show only today and future classes
  const todaysMeetings = meetings.filter((meeting: Meeting) => isToday(meeting.scheduledDate || ''));
  const upcomingMeetings = meetings.filter((meeting: Meeting) => isUpcoming(meeting.scheduledDate || ''));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto py-4 md:py-6 px-3 md:px-4">
        <div className="max-w-4xl mx-auto px-1 md:px-0">
          <div className="mb-4 md:mb-6 px-2 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              Online Classes
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">Join today's scheduled classes</p>
          </div>

          {isLoading ? (
            <Card className="mx-2 md:mx-0">
              <CardContent className="p-4 md:p-6 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <p className="text-sm md:text-base">Loading classes...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="mx-2 md:mx-0">
              <CardContent className="p-4 md:p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load classes. Please try again later.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6 px-2 md:px-0">
              {/* Today's Classes */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  Today's Classes
                </h2>

                {todaysMeetings.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-semibold mb-2">No classes scheduled for today</h3>
                      <p className="text-sm md:text-base text-gray-600">Check back later or contact your teacher</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 md:gap-4">
                    {todaysMeetings.map((meeting: Meeting) => (
                      <Card
                        key={meeting.meetingId}
                        className={`${isMeetingAvailable(meeting) ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg md:text-xl font-semibold">{meeting.meetingName}</h3>
                                <div className="flex items-center gap-2">
                                  {isMeetingAvailable(meeting) ? (
                                    <Badge className="bg-green-500 text-xs">Available Now</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                                  )}
                                  {meeting.password && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Protected
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {meeting.subjectDescription && (
                                <p className="text-xs md:text-sm text-gray-700 mb-2">
                                  {meeting.subjectDescription}
                                </p>
                              )}

                              <div className="space-y-1 text-xs md:text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <Video className="h-3 w-3 md:h-4 md:w-4" />
                                  Meeting ID: <span className="font-semibold text-gray-800">{meeting.meetingId}</span>
                                </p>
                                {meeting.password && (
                                  <p className="flex items-center gap-2">
                                    <Lock className="h-3 w-3 md:h-4 md:w-4" />
                                    Passcode: <span className="font-semibold text-gray-800">{meeting.password}</span>
                                  </p>
                                )}
                                {meeting.scheduledDate && (
                                  <p className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                    Date: <span className="font-semibold text-gray-800">{new Date(meeting.scheduledDate).toLocaleDateString()}</span>
                                  </p>
                                )}
                                {meeting.scheduledTime && (
                                  <p className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                    Time: <span className="font-semibold text-gray-800">{formatTime(meeting.scheduledTime)}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 lg:flex-shrink-0">
                              <Button
                                onClick={() => handleJoinMeeting(meeting)}
                                disabled={!isMeetingAvailable(meeting)}
                                className={`flex items-center justify-center gap-2 w-full lg:w-auto text-sm ${isMeetingAvailable(meeting)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-gray-400'
                                  }`}
                                size="sm"
                              >
                                <Users className="h-3 w-3 md:h-4 md:w-4" />
                                {isMeetingAvailable(meeting) ? 'Join Class' : 'Not Available'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Classes */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 text-blue-600">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Upcoming Classes
                </h2>

                {upcomingMeetings.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-semibold mb-2">No upcoming classes scheduled</h3>
                      <p className="text-sm md:text-base text-gray-600">Check back later for future classes</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 md:gap-4">
                    {upcomingMeetings.map((meeting: Meeting) => {
                      const isTodayMeeting = isToday(meeting.scheduledDate || '');
                      return (
                        <Card key={meeting.meetingId} className={`${isTodayMeeting ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'}`}>
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h3 className="text-lg md:text-xl font-semibold">{meeting.meetingName}</h3>
                                  <Badge className={`${isTodayMeeting ? 'bg-green-500' : 'bg-blue-500'} text-xs w-fit`}>
                                    {isTodayMeeting ? 'Today' : 'Upcoming'}
                                  </Badge>
                                </div>

                                {meeting.subjectDescription && (
                                  <p className="text-xs md:text-sm text-gray-700 mb-2">
                                    {meeting.subjectDescription}
                                  </p>
                                )}

                                <div className="space-y-1 text-xs md:text-sm text-gray-600">
                                  <p className="flex items-center gap-2">
                                    <Video className="h-3 w-3 md:h-4 md:w-4" />
                                    Meeting ID: <span className="font-semibold text-gray-800">{meeting.meetingId}</span>
                                  </p>
                                  {meeting.password && (
                                    <p className="flex items-center gap-2">
                                      <Lock className="h-3 w-3 md:h-4 md:w-4" />
                                      Passcode: <span className="font-semibold text-gray-800">{meeting.password}</span>
                                    </p>
                                  )}
                                  {meeting.scheduledDate && (
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                      Date: <span className="font-semibold text-gray-800">{new Date(meeting.scheduledDate).toLocaleDateString()}</span>
                                    </p>
                                  )}
                                  {meeting.scheduledTime && (
                                    <p className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                      Time: <span className="font-semibold text-gray-800">{formatTime(meeting.scheduledTime)}</span>
                                    </p>
                                  )}
                                  {/* {meeting.zoomJoinUrl && (
                                    <p className="flex items-center gap-2 break-all">
                                      <Video className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                      Meeting URL: <a href={meeting.zoomJoinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{meeting.zoomJoinUrl}</a>
                                    </p>
                                  )} */}
                                </div>
                              </div>

                              <div className="flex gap-2 lg:flex-shrink-0">
                                {isTodayMeeting ? (
                                  <Button
                                    onClick={() => handleJoinMeeting(meeting)}
                                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 w-full lg:w-auto text-sm"
                                    size="sm"
                                  >
                                    <Users className="h-3 w-3 md:h-4 md:w-4" />
                                    Join
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-3 py-1">
                                    Coming Soon
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Help Section */}
              <Card className="mt-4 md:mt-6">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    How to Join Classes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">For Students:</h4>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-xs md:text-sm">
                      <li>Only today's classes are available to join immediately</li>
                      <li>Future classes are shown in "Upcoming Classes" section</li>
                      <li>Click "Join Class" button when today's class is available</li>
                      <li>Make sure you have your camera and microphone ready</li>
                    </ul>
                  </div>
                  <Alert>
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                    <AlertDescription className="text-xs md:text-sm">
                      If you can't see today's class, please contact your teacher or check back at the scheduled time.
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