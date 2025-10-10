import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Users, BookOpen, MessageSquare, BarChart3 } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';

// Import the separate components
import ProfileManagement from './ProfileManagement';
import SecuritySettings from './SecuritySettings';
import FriendsManagement from './FriendsManagement';
import ExamHistory from './ExamHistory';
import FeedbackSystem from './FeedbackSystem';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || 'current-user-id';
  
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery(userId);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds (1 minute)

    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  // Function to get greeting based on current time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning! 🌅";
    if (hour < 17) return "Good afternoon! ☀️";
    return "Good evening! 🌙";
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Settings },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'exams', label: 'Exam History', icon: BookOpen },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileManagement userId={userId} />;
      case 'security':
        return <SecuritySettings userId={userId} />;
      case 'friends':
        return <FriendsManagement userId={userId} />;
      case 'exams':
        return <ExamHistory userId={userId} />;
      case 'feedback':
        return <FeedbackSystem userId={userId} />;
      default:
        return <ProfileManagement userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header Component */}
      <Header />
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Dashboard!
            </h1>
            <Badge variant="outline" className="text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-300">
              {getGreeting()}
            </Badge>
          </div>
          <p className="text-lg text-gray-600">
            Manage your profile and track your learning progress!
          </p>

          {/* Dashboard Stats */}
          {dashboardStats && !statsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Friends</p>
                      <p className="text-2xl font-bold">{dashboardStats.totalFriends}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Exams Taken</p>
                      <p className="text-2xl font-bold">{dashboardStats.totalExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-500">Average Score</p>
                      <p className="text-2xl font-bold">{dashboardStats.averageScore.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-lg font-bold">{new Date(dashboardStats.memberSince).getFullYear()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
                        : 'hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 hover:text-purple-700 hover:border-purple-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Active Tab Content */}
        <div className="space-y-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;