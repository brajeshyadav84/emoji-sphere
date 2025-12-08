import { memo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptimizedInput, OptimizedTextarea } from "@/components/OptimizedInput";
import { type TeacherMeeting, type TeacherMeetingRequest } from "@/store/api/teacherMeetingsApi";

interface MeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMeeting: TeacherMeeting | null;
  formData: TeacherMeetingRequest;
  onInputChange: (field: keyof TeacherMeetingRequest, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  timeZones: string[];
}

const MeetingDialog = memo(({
  isOpen,
  onOpenChange,
  editingMeeting,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  timeZones
}: MeetingDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-blue-900 dark:text-blue-100">
            {editingMeeting ? "Edit Meeting" : "Create New Meeting"}
          </DialogTitle>
          <DialogDescription>
            {editingMeeting ? "Update the meeting details below" : "Fill in the details to schedule a new meeting"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subjectTitle" className="text-blue-900 dark:text-blue-100">
              Subject Title <span className="text-red-500">*</span>
            </Label>
            <OptimizedInput
              id="subjectTitle"
              placeholder="e.g., Advanced Mathematics - Calculus"
              value={formData.subjectTitle}
              onChange={(value) => onInputChange("subjectTitle", value)}
              className="border-blue-300 dark:border-blue-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectDescription" className="text-blue-900 dark:text-blue-100">
              Subject Description
            </Label>
            <OptimizedTextarea
              id="subjectDescription"
              placeholder="Brief description of what will be covered in this session"
              value={formData.subjectDescription}
              onChange={(value) => onInputChange("subjectDescription", value)}
              rows={3}
              className="border-blue-300 dark:border-blue-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingUrl" className="text-blue-900 dark:text-blue-100">
              Meeting URL
            </Label>
            <OptimizedInput
              id="meetingUrl"
              placeholder="https://zoom.us/j/1234567890"
              value={formData.meetingUrl}
              onChange={(value) => onInputChange("meetingUrl", value)}
              className="border-blue-300 dark:border-blue-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meetingId" className="text-blue-900 dark:text-blue-100">
                Meeting ID
              </Label>
              <OptimizedInput
                id="meetingId"
                placeholder="123 456 7890"
                value={formData.meetingId}
                onChange={(value) => onInputChange("meetingId", value)}
                className="border-blue-300 dark:border-blue-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passcode" className="text-blue-900 dark:text-blue-100">
                Passcode
              </Label>
              <OptimizedInput
                id="passcode"
                placeholder="Enter passcode"
                value={formData.passcode}
                onChange={(value) => onInputChange("passcode", value)}
                className="border-blue-300 dark:border-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-blue-900 dark:text-blue-100">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <OptimizedInput
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(value) => onInputChange("startTime", value)}
                className="border-blue-300 dark:border-blue-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-blue-900 dark:text-blue-100">
                End Time <span className="text-red-500">*</span>
              </Label>
              <OptimizedInput
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(value) => onInputChange("endTime", value)}
                className="border-blue-300 dark:border-blue-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeZone" className="text-blue-900 dark:text-blue-100">
              Time Zone
            </Label>
            <Select 
              value={formData.timeZone} 
              onValueChange={(value) => onInputChange("timeZone", value)}
            >
              <SelectTrigger className="border-blue-300 dark:border-blue-700">
                <SelectValue placeholder="Select a time zone" />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-blue-300"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {editingMeeting ? "Updating..." : "Creating..."}
              </>
            ) : (
              editingMeeting ? "Update Meeting" : "Create Meeting"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

MeetingDialog.displayName = "MeetingDialog";

export default MeetingDialog;
