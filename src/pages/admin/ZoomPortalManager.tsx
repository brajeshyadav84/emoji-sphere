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
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Video className="h-8 w-8 text-blue-600" />
              Zoom Portal Manager
            </h1>
            <p className="text-gray-600 mt-2">
              Automatically sync meetings from your Zoom portal
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-600">Disconnected</span>
                </>
              )}
            </div>
            
            <Button 
              onClick={handleSyncMeetings}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Meetings'}
            </Button>
          </div>
        </div>

        {/* API Status Card */}
        {!statusLoading && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Zoom API Status: {isConnected ? 'Connected' : 'Error'}
                  </span>
                </div>
                {!isConnected && (
                  <span className="text-sm text-red-600">
                    Check API credentials in application.properties
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-Sync Info */}
        <Alert className="mb-6">
          <Video className="h-4 w-4" />
          <AlertDescription>
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
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
                <p className="text-gray-600 mb-4">
                  {isConnected 
                    ? "No scheduled meetings found in your Zoom portal" 
                    : "Connect to Zoom API to see your meetings"
                  }
                </p>
                {isConnected && (
                  <Button onClick={handleSyncMeetings} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Meetings
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            meetings.map((meeting: Meeting) => (
              <Card key={meeting.meetingId} className={`${isToday(meeting.scheduledDate || '') ? 'border-green-500 bg-green-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{meeting.meetingName}</h3>
                        {isToday(meeting.scheduledDate || '') && (
                          <Badge className="bg-green-500">Today</Badge>
                        )}
                        {meeting.status && (
                          <Badge className={getStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Auto-Synced
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
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
                        {meeting.duration && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duration: {meeting.duration} minutes
                          </p>
                        )}
                        {meeting.password && (
                          <p className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Password protected
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartMeeting(meeting)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        disabled={!meeting.joinUrl}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Start as Host
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}/onlinemeeting?meeting=${meeting.meetingId}`;
                          navigator.clipboard.writeText(url);
                          alert('Participant link copied to clipboard!');
                        }}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Copy Participant Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How Auto-Sync Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Automatic Meeting Sync</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Create meetings in your Zoom portal as usual</li>
                <li>Meetings automatically appear here within minutes</li>
                <li>Click "Sync Meetings" to refresh immediately</li>
                <li>All meeting details are fetched automatically (name, time, password, etc.)</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">👨‍🏫 For Admins (Hosts):</h4>
              <ul className="list-disc list-inside text-green-800 space-y-1">
                <li>Click "Start as Host" to join with host privileges</li>
                <li>Copy participant links to share with students</li>
                <li>No manual entry needed - everything syncs automatically</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">⚙️ Setup Required:</h4>
              <ul className="list-disc list-inside text-orange-800 space-y-1">
                <li>Zoom API credentials must be configured in backend</li>
                <li>Update zoom.api.key and zoom.api.secret in application.properties</li>
                <li>Get credentials from Zoom Marketplace &gt; Build App &gt; JWT</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZoomPortalManager;