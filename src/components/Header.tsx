import { Bell, Menu, User } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-3xl">🌈</div>
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              KidSpace
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="text-base font-medium">
            🏠 Feed
          </Button>
          <Button variant="ghost" className="text-base font-medium">
            👥 Groups
          </Button>
          <Button variant="ghost" className="text-base font-medium">
            💬 Chat
          </Button>
          <Button variant="ghost" className="text-base font-medium">
            🎮 Games
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary" />
          </Button>
          <Button variant="default" size="icon" className="gradient-primary">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
