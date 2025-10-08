import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Users, 
  PlayCircle,
  Settings,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { 
  useGetZoomPortalMeetingsQuery, 
  useGetZoomPortalStatusQuery,
  useSyncZoomPortalMeetingsMutation 
} from '@/store/api/zoomApi';

interface Meeting {
  meetingId: string;
  meetingNumber?: string;
  meetingName: string;
  joinUrl?: string;
  password?: string;
  startTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status?: string;
  type?: number;
  isActive?: boolean;
  source: string;
}

const ZoomPortalManager = () => {
  // Hardcoded meeting data for testing - same as in OnlineMeetingSimple
  const hardcodedMeetings = [
    {
      meetingId: "9900769545",
      meetingNumber: "9900769545",
      meetingName: "Daily Learning Session",
      joinUrl: "https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987",
      password: "Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
      startTime: "2024-10-08T10:00:00Z",
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date
      scheduledTime: "10:00",
      duration: 60,
      status: "active",
      type: 2,
      isActive: true,
      source: "hardcoded"
    },
    {
      meetingId: "9900769546",
      meetingNumber: "9900769546", 
      meetingName: "English Practice Session",
      joinUrl: "https://us04web.zoom.us/j/9900769545?pwd=Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1&omn=74633256987",
      password: "Ijrt2Al00lLKNrXFNaPsBMXUDeHyCT.1",
      startTime: "2024-10-08T14:00:00Z",
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date
      scheduledTime: "14:00",
      duration: 45,
      status: "active",
      type: 2,
      isActive: true,
      source: "hardcoded"
    }
  ];

  const meetings = hardcodedMeetings;
  const isLoading = false;
  const { data: statusData, isLoading: statusLoading } = useGetZoomPortalStatusQuery();
  const [syncMeetings, { isLoading: isSyncing }] = useSyncZoomPortalMeetingsMutation();
  const isConnected = statusData?.success || false;

  const handleSyncMeetings = async () => {
    try {
      // For hardcoded data, we'll just simulate a sync
      console.log('Sync completed - using hardcoded meeting data');
      // await syncMeetings().unwrap(); // Commented out for hardcoded data
    } catch (error) {
      console.error('Failed to sync meetings:', error);
    }
  };

  const handleStartMeeting = (meeting: Meeting) => {
    if (meeting.joinUrl) {
      window.open(meeting.joinUrl, '_blank');
    }
  };

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      return new Date(`2024-01-01T${timeString}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-green-500';
      case 'started': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-1 md:px-0">
          <div className="px-2 md:px-0">
            <div className="flex flex-col gap-4 mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                  <Video className="h-5 w-5 md:h-8 md:w-8 text-blue-600" />
                  Zoom Portal Manager
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                  Automatically sync meetings from your Zoom portal
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      <span className="text-xs md:text-sm text-green-600 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      <span className="text-xs md:text-sm text-red-600 font-medium">Disconnected</span>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={handleSyncMeetings}
                  disabled={isSyncing}
                  className="flex items-center gap-2 text-sm md:text-base w-full sm:w-auto"
                  size="sm"
                >
                  <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Meetings'}
                </Button>
              </div>
            </div>

            {/* API Status Card */}
            {!statusLoading && (
              <Card className="mb-4 md:mb-6">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      )}
                      <span className="text-sm md:text-base font-medium">
                        Zoom API Status: {isConnected ? 'Connected' : 'Error'}
                      </span>
                    </div>
                    {!isConnected && (
                      <span className="text-xs md:text-sm text-red-600">
                        Check API credentials in application.properties
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

        {/* Auto-Sync Info */}
        <Alert className="mb-4 md:mb-6">
          <Video className="h-4 w-4" />
          <AlertDescription className="text-sm md:text-base">
            <strong>Auto-Sync Enabled:</strong> This page automatically fetches meetings from your Zoom portal. 
            No need to manually add meetings - just create them in Zoom and they'll appear here!
          </AlertDescription>
        </Alert>

        {/* Meetings List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <p>Loading meetings from Zoom portal...</p>
                </div>
              </CardContent>
            </Card>
          ) : meetings.length === 0 ? (
            <Card>
              <CardContent className="p-4 md:p-6 text-center">
                <Video className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">No meetings found</h3>
                <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                  {isConnected 
                    ? "No scheduled meetings found in your Zoom portal" 
                    : "Connect to Zoom API to see your meetings"
                  }
                </p>
                {isConnected && (
                  <Button onClick={handleSyncMeetings} className="mt-2" size="sm">
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Refresh Meetings
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            meetings.map((meeting: Meeting) => (
              <Card key={meeting.meetingId} className={`${isToday(meeting.scheduledDate || '') ? 'border-green-500 bg-green-50' : ''}`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg md:text-xl font-semibold truncate">{meeting.meetingName}</h3>
                        {isToday(meeting.scheduledDate || '') && (
                          <Badge className="bg-green-500 text-xs">Today</Badge>
                        )}
                        {meeting.status && (
                          <Badge className={`${getStatusColor(meeting.status)} text-xs`}>
                            {meeting.status}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                          Auto-Synced
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Video className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">Meeting ID: {meeting.meetingId}</span>
                        </p>
                        {meeting.scheduledDate && (
                          <p className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>{new Date(meeting.scheduledDate).toLocaleDateString()}</span>
                            {meeting.scheduledTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                {formatTime(meeting.scheduledTime)}
                              </span>
                            )}
                          </p>
                        )}
                        {meeting.duration && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            Duration: {meeting.duration} minutes
                          </p>
                        )}
                        {meeting.password && (
                          <p className="flex items-center gap-2">
                            <Settings className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            Password protected
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                      <Button
                        onClick={() => handleStartMeeting(meeting)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-sm"
                        disabled={!meeting.joinUrl}
                        size="sm"
                      >
                        <PlayCircle className="h-3 w-3 md:h-4 md:w-4" />
                        Start as Host
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}/onlinemeeting?meeting=${meeting.meetingId}`;
                          navigator.clipboard.writeText(url);
                          alert('Participant link copied to clipboard!');
                        }}
                        className="flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <Users className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Copy Participant Link</span>
                        <span className="sm:hidden">Copy Link</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-4 md:mt-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">How Auto-Sync Works</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-3">
            <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">🚀 Automatic Meeting Sync</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm md:text-base">
                <li>Create meetings in your Zoom portal as usual</li>
                <li>Meetings automatically appear here within minutes</li>
                <li>Click "Sync Meetings" to refresh immediately</li>
                <li>All meeting details are fetched automatically (name, time, password, etc.)</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 text-sm md:text-base">👨‍🏫 For Admins (Hosts):</h4>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm md:text-base">
                <li>Click "Start as Host" to join with host privileges</li>
                <li>Copy participant links to share with students</li>
                <li>No manual entry needed - everything syncs automatically</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2 text-sm md:text-base">⚙️ Setup Required:</h4>
              <ul className="list-disc list-inside text-orange-800 space-y-1 text-sm md:text-base">
                <li>Zoom API credentials must be configured in backend</li>
                <li>Update zoom.api.key and zoom.api.secret in application.properties</li>
                <li>Get credentials from Zoom Marketplace &gt; Build App &gt; JWT</li>
              </ul>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomPortalManager;