import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TeacherDetailsForm from '@/components/TeacherDetailsForm';
import React from 'react';


const TeachersDetails = () => {
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
                <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Teacher Details</h1>
                <p className="text-sm text-blue-700 dark:text-blue-300">Manage your profile and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" onClick={() => navigate('/teachers')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeacherDetailsForm />
      </div>
    </div>
  );
};

export default TeachersDetails;