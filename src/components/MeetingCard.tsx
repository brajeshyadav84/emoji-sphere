import { memo } from "react";
import { Pencil, Trash2, Calendar, Clock, Globe, Key, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type TeacherMeeting } from "@/store/api/teacherMeetingsApi";

interface MeetingCardProps {
  meeting: TeacherMeeting;
  status: { label: string; color: string };
  formatDateTime: (dateTimeString: string) => string;
  onEdit: (meeting: TeacherMeeting) => void;
  onDelete: (meeting: TeacherMeeting) => void;
}

const MeetingCard = memo(({ meeting, status, formatDateTime, onEdit, onDelete }: MeetingCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                {meeting.subjectTitle}
              </CardTitle>
              <Badge className={`${status.color} text-white`}>
                {status.label}
              </Badge>
            </div>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              {meeting.subjectDescription}
            </CardDescription>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(meeting)}
              className="border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(meeting)}
              className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Meeting URL</p>
                <a 
                  href={meeting.meetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {meeting.meetingUrl}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Meeting ID</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{meeting.meetingId}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Key className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Passcode</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{meeting.passcode}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Start Time</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{formatDateTime(meeting.startTime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">End Time</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{formatDateTime(meeting.endTime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Time Zone</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{meeting.timeZone}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MeetingCard.displayName = "MeetingCard";

export default MeetingCard;
