import { useAppSelector } from "@/store/hooks";
import { Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Calendar, FileText, BarChart3, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/teacher-login" replace />;
  }

  // Redirect if not a teacher
  if (user?.role !== 'TEACHER') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  Teacher Dashboard
                </h1>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Welcome back, {user?.fullName}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/auth/login"}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">5</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">128</div>
              <p className="text-xs text-muted-foreground">Total students</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">12</div>
              <p className="text-xs text-muted-foreground">Pending reviews</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">Quick Actions</CardTitle>
              <CardDescription>Manage your teaching activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-auto flex-col p-4 bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Lesson</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col p-4 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => navigate("/teachers/meetings")}
                >
                  <Video className="h-6 w-6 mb-2" />
                  <span className="text-sm">Setup Meetings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col p-4 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => navigate("/teachers/details")}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Teacher Details</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col p-4 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Grade Book</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Math Quiz - Grade 8</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">25 students submitted</p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Science Project</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">New assignment created</p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">1 day ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Parent Meeting</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Scheduled for Friday</p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}