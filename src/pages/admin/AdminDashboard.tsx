import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, Trophy, Calendar, Video } from "lucide-react";

const AdminDashboard = () => {
  const adminSections = [
    {
      title: "Group Management",
      description: "Create and manage groups, set privacy settings",
      icon: Users,
      path: "/admin/groups",
      color: "text-blue-500",
    },
    {
      title: "Quiz Management",
      description: "Create quizzes with 10 questions each",
      icon: BookOpen,
      path: "/admin/quizzes",
      color: "text-green-500",
    },
    {
      title: "Daily Questions",
      description: "Manage daily knowledge questions for kids",
      icon: Calendar,
      path: "/admin/questions",
      color: "text-purple-500",
    },
    {
      title: "Daily Challenges",
      description: "Add grade-wise daily challenges",
      icon: Trophy,
      path: "/admin/challenges",
      color: "text-orange-500",
    },
    {
      title: "Holiday Assignments",
      description: "Assign summer and winter tasks",
      icon: Calendar,
      path: "/admin/assignments",
      color: "text-purple-500",
    },
    {
      title: "Zoom Portal Manager",
      description: "Manage meetings from Zoom portal for web app joining",
      icon: Video,
      path: "/zoom-portal",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-1 md:px-0">
          <div className="mb-6 md:mb-8 px-2 md:px-0">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              <span className="gradient-text-primary">Admin Dashboard</span> 👨‍💼
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Manage your platform and create content for kids
            </p>
          </div>

          <div className="px-2 md:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {adminSections.map((section) => (
                <Link key={section.path} to={section.path}>
                  <Card className="p-4 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 hover:scale-105 cursor-pointer">
                    <section.icon className={`h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 ${section.color}`} />
                    <h3 className="text-lg md:text-xl font-bold mb-2">{section.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>

            <Card className="mt-6 md:mt-8 p-4 md:p-6 bg-accent/20">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">12</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-secondary">25</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Active Quizzes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-purple-500">10</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Daily Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-success">30</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Daily Challenges</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;