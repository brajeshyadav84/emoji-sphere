import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { Navigate, useNavigate } from "react-router-dom";
import { Video, Plus, Calendar, Clock, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MeetingDialog from "@/components/MeetingDialog";
import MeetingCard from "@/components/MeetingCard";
import { 
  useGetAllMeetingsQuery, 
  useCreateMeetingMutation, 
  useUpdateMeetingMutation, 
  useDeleteMeetingMutation,
  type TeacherMeeting,
  type TeacherMeetingRequest
} from "@/store/api/teacherMeetingsApi";
import { toast } from "sonner";

const TIME_ZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland"
];

export default function TeacherMeetings() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: meetingsResponse, isLoading, error, refetch } = useGetAllMeetingsQuery();
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();
  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingMutation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<TeacherMeeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<TeacherMeeting | null>(null);
  const [formData, setFormData] = useState<TeacherMeetingRequest>({
    subjectTitle: "",
    subjectDescription: "",
    meetingUrl: "",
    meetingId: "",
    passcode: "",
    startTime: "",
    endTime: "",
    timeZone: "America/New_York"
  });

  // Get meetings from API response - memoized
  const meetings = useMemo(() => meetingsResponse?.data || [], [meetingsResponse?.data]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/teacher-login" replace />;
  }

  // Redirect if not a teacher
  if (user?.role !== 'TEACHER') {
    return <Navigate to="/auth/login" replace />;
  }

  // Direct state update without transition - faster and prevents violations
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    setFormData({
      subjectTitle: "",
      subjectDescription: "",
      meetingUrl: "",
      meetingId: "",
      passcode: "",
      startTime: "",
      endTime: "",
      timeZone: "America/New_York"
    });
    setIsDialogOpen(true);
  };

  const handleEditMeeting = (meeting: TeacherMeeting) => {
    setEditingMeeting(meeting);
    setFormData({
      subjectTitle: meeting.subjectTitle,
      subjectDescription: meeting.subjectDescription || "",
      meetingUrl: meeting.meetingUrl || "",
      meetingId: meeting.meetingId || "",
      passcode: meeting.passcode || "",
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      timeZone: meeting.timeZone
    });
    setIsDialogOpen(true);
  };

  const handleDeleteMeeting = (meeting: TeacherMeeting) => {
    setDeletingMeeting(meeting);
  };

  const confirmDeleteMeeting = async () => {
    if (!deletingMeeting) return;
    
    try {
      await deleteMeeting(Number(deletingMeeting.id)).unwrap();
      toast.success("Meeting deleted successfully");
      setDeletingMeeting(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete meeting");
      console.error("Delete error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.subjectTitle || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Format the data for API
    const meetingData: TeacherMeetingRequest = {
      subjectTitle: formData.subjectTitle,
      subjectDescription: formData.subjectDescription || "",
      meetingUrl: formData.meetingUrl || "",
      meetingId: formData.meetingId || "",
      passcode: formData.passcode || "",
      startTime: formData.startTime,
      endTime: formData.endTime,
      timeZone: formData.timeZone
    };

    try {
      if (editingMeeting) {
        // Update existing meeting
        await updateMeeting({ 
          id: Number(editingMeeting.id), 
          meeting: meetingData 
        }).unwrap();
        toast.success("Meeting updated successfully");
      } else {
        // Create new meeting
        await createMeeting(meetingData).unwrap();
        toast.success("Meeting created successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save meeting");
      console.error("Save error:", error);
    }
  };

  // Memoized helper functions to prevent unnecessary recalculations
  const formatDateTime = useCallback((dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const getMeetingStatus = useCallback((startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: "Upcoming", color: "bg-blue-500" };
    if (now >= start && now <= end) return { label: "Live", color: "bg-green-500" };
    return { label: "Completed", color: "bg-gray-500" };
  }, []);

  // Memoized sorted meetings - only recalculates when meetings array changes
  const sortedMeetings = useMemo(() => 
    [...meetings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [meetings]
  );
  
  // Memoized statistics calculations
  const meetingStats = useMemo(() => {
    const upcoming = meetings.filter(m => {
      const now = new Date();
      const start = new Date(m.startTime);
      return start > now;
    }).length;
    
    const thisWeek = meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return meetingDate >= today && meetingDate <= weekFromNow;
    }).length;
    
    return { upcoming, thisWeek };
  }, [meetings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  Meeting Management
                </h1>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Create and manage your virtual classes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateMeeting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
              <Button variant="outline" onClick={() => navigate("/teachers")}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Video className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{meetings.length}</div>
              <p className="text-xs text-muted-foreground">All scheduled meetings</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {meetingStats.upcoming}
              </div>
              <p className="text-xs text-muted-foreground">Future sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {meetingStats.thisWeek}
              </div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Loading meetings...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">Failed to load meetings</p>
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : sortedMeetings.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-blue-300 dark:text-blue-700 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  No meetings yet
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Create your first meeting to get started
                </p>
                <Button onClick={handleCreateMeeting} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                status={getMeetingStatus(meeting.startTime, meeting.endTime)}
                formatDateTime={formatDateTime}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
              />
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Meeting Dialog */}
      <MeetingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingMeeting={editingMeeting}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        timeZones={TIME_ZONES}
      />

      {/* Delete Meeting Confirmation Dialog */}
      <Dialog open={!!deletingMeeting} onOpenChange={(open) => !open && setDeletingMeeting(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Meeting?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingMeeting?.subjectTitle}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingMeeting(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteMeeting}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
