import { Bell, Menu, User, X, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "./ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-3xl">🌈</div>
            <h1 className="text-xl font-bold gradient-text-primary">
              KidSpace
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Button 
            variant={isActive("/") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/")}
          >
            <span className="flex items-center gap-1">
              🏠 <span>Feed</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/groups") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/groups") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/groups")}
          >
            <span className="flex items-center gap-1">
              👥 <span>Groups</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/chat") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/chat") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/chat")}
          >
            <span className="flex items-center gap-1">
              💬 <span>Messages</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/games") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/games") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/games")}
          >
            <span className="flex items-center gap-1">
              🎮 <span>Fun Games!</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/exams") || location.pathname.startsWith("/exam/") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/exams") || location.pathname.startsWith("/exam/") 
                ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/exams")}
          >
            <span className="flex items-center gap-1">
              📝 <span>Exams</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/admin") || location.pathname.startsWith("/admin/") ? "default" : "ghost"}
            className={`text-base font-medium whitespace-nowrap min-w-fit ${
              isActive("/admin") || location.pathname.startsWith("/admin/") 
                ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/admin")}
          >
            <span className="flex items-center gap-1">
              👨‍💼 <span>Dashboard</span>
            </span>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary" />
              </Button>
              <Button variant="default" size="icon" className="gradient-primary">
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="gradient-primary"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <nav className="container px-4 py-4 flex flex-col gap-2">
            <Button 
              variant={isActive("/") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/") 
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                🏠 <span>Feed</span>
              </span>
            </Button>
            <Button 
              variant={isActive("/groups") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/groups") 
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/groups");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                👥 <span>Groups</span>
              </span>
            </Button>
            <Button 
              variant={isActive("/chat") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/chat") 
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/chat");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                💬 <span>Messages</span>
              </span>
            </Button>
            <Button 
              variant={isActive("/games") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/games") 
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/games");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                🎮 <span>Fun Games!</span>
              </span>
            </Button>
            <Button 
              variant={isActive("/exams") || location.pathname.startsWith("/exam/") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/exams") || location.pathname.startsWith("/exam/") 
                  ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/exams");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                📝 <span>Exams</span>
              </span>
            </Button>
            <Button 
              variant={isActive("/admin") || location.pathname.startsWith("/admin/") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/admin") || location.pathname.startsWith("/admin/") 
                  ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/admin");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                👨‍💼 <span>Dashboard</span>
              </span>
            </Button>
            {user && (
              <Button 
                variant="ghost"
                className="text-base font-medium justify-start w-full text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </span>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
