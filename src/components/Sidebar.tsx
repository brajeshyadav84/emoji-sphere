import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Shield, Trophy, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: "🏠", label: "My Feed", path: "/" },
    { icon: "👥", label: "My Groups", path: "/groups" },
    { icon: "💬", label: "Messages", path: "/chat" },
    { icon: "🎮", label: "Games", path: "/games" },
    { icon: "🏆", label: "Achievements", path: "/" },
  ];

  return (
    <aside className="space-y-4">
      <Card className="p-4 shadow-playful">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-secondary" />
          Quick Menu
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={`w-full justify-start gap-3 text-base ${
                location.pathname === item.path ? "gradient-primary font-semibold" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </nav>
      </Card>

      <Card className="p-4 shadow-playful gradient-success">
        <div className="flex items-start gap-3 text-success-foreground">
          <Shield className="h-6 w-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-base mb-1">Safe & Fun!</h3>
            <p className="text-sm opacity-90">
              Your parents can see everything you do here. Be kind and respectful! 🌟
            </p>
          </div>
        </div>
      </Card>

      {/* <Card className="p-4 shadow-playful">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Suggested Friends
        </h3>
        <div className="space-y-3">
          {["🦊", "🐼", "🦁", "🐨"].map((emoji, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-lg">
                  {emoji}
                </div>
                <span className="text-sm font-medium">Friend {index + 1}</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Add
              </Button>
            </div>
          ))}
        </div>
      </Card> */}
    </aside>
  );
};

export default Sidebar;
