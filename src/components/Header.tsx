import { Bell, Menu, User, X, LogIn, LogOut, Video } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "./ui/use-toast";
import { useAppSelector } from "@/store/hooks";
import { logout, loadUserFromStorage } from "@/store/authSlice";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load user from localStorage on component mount
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-14 md:h-16 items-center justify-between px-2 md:px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-1 md:gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="text-xl md:text-3xl">🌈</div>
            <h1 className="text-lg md:text-xl font-bold gradient-text-primary">
              KidSpace
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Button 
            variant={isActive("/") ? "default" : "ghost"}
            className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
              isActive("/") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/")}
          >
            <span className="flex items-center gap-1">
              🏠 <span className="hidden lg:inline">Feed</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/groups") ? "default" : "ghost"}
            className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
              isActive("/groups") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/groups")}
          >
            <span className="flex items-center gap-1">
              👥 <span className="hidden lg:inline">Groups</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/chat") ? "default" : "ghost"}
            className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
              isActive("/chat") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/chat")}
          >
            <span className="flex items-center gap-1">
              💬 <span className="hidden lg:inline">Messages</span>
            </span>
          </Button>
          
          <Button 
            variant={isActive("/games") ? "default" : "ghost"}
            className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
              isActive("/games") 
                ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/games")}
          >
            <span className="flex items-center gap-1">
              🎮 <span className="hidden lg:inline">Fun Games!</span>
            </span>
          </Button>
          <Button 
            variant={isActive("/knowledge/planets") ? "default" : "ghost"}
            className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
              isActive("/knowledge/planets") 
                ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => navigate("/knowledge/planets")}
          >
            <span className="flex items-center gap-1">
              🪐 <span className="hidden lg:inline">Planets</span>
            </span>
          </Button>
          {/* Only show Dashboard for Admin users */}
          {isAuthenticated && user && user.role === 'ADMIN' && (
            <Button 
              variant={isActive("/admin") || location.pathname.startsWith("/admin/") ? "default" : "ghost"}
              className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
                isActive("/admin") || location.pathname.startsWith("/admin/") 
                  ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => navigate("/admin")}
            >
              <span className="flex items-center gap-1">
                👨‍💼 <span className="hidden lg:inline">Dashboard</span>
              </span>
            </Button>
          )}
          {/* Only show Dashboard for TEACHER users */}
          {isAuthenticated && user && user.role === 'TEACHER' && (
            <Button 
              variant={isActive("/teachers") || location.pathname.startsWith("/teachers/") ? "default" : "ghost"}
              className={`text-[1.5rem] lg:text-base font-medium whitespace-nowrap min-w-fit px-2 lg:px-3 ${
                isActive("/teachers") || location.pathname.startsWith("/teachers/") 
                  ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => navigate("/teachers")}
            >
              <span className="flex items-center gap-1">
                👨‍💼 <span className="hidden lg:inline">Dashboard</span>
              </span>
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary" />
              </Button>
              <UserDropdown />
              
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="gradient-primary text-xs md:text-sm px-2 md:px-3"
            >
              <LogIn className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
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
              variant={isActive("/knowledge/planets") ? "default" : "ghost"}
              className={`text-base font-medium justify-start w-full ${
                isActive("/knowledge/planets") 
                  ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => {
                navigate("/knowledge/planets");
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                🪐 <span>Planets</span>
              </span>
            </Button>
            {isAuthenticated && user && (
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={`text-base font-medium justify-start w-full ${
                  isActive("/dashboard") 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => {
                  navigate("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  👤 <span>My Profile</span>
                </span>
              </Button>
            )}
            {/* Only show Admin Dashboard for Admin users */}
            {isAuthenticated && user && user.role === 'ADMIN' && (
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
                  👨‍💼 <span>Admin</span>
                </span>
              </Button>
            )}
            {/* Only show Admin Dashboard for TEACHER users */}
            {isAuthenticated && user && user.role === 'TEACHER' && (
              <Button 
                variant={isActive("/teachers") || location.pathname.startsWith("/teachers/") ? "default" : "ghost"}
                className={`text-base font-medium justify-start w-full ${
                  isActive("/teachers") || location.pathname.startsWith("/teachers/") 
                    ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => {
                  navigate("/teachers");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  👨‍💼 <span>Teacher</span>
                </span>
              </Button>
            )}
            {isAuthenticated && user && (
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
