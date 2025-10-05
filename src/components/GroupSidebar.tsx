import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  emoji: string | null;
}

interface GroupSidebarProps {
  currentGroupId?: string;
}

const GroupSidebar = ({ currentGroupId }: GroupSidebarProps) => {
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([]);
  const [otherGroups, setOtherGroups] = useState<Group[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Fetch enrolled groups
    const { data: enrolledData, error: enrolledError } = await supabase
      .from("group_members")
      .select("groups:group_id (id, name, emoji)")
      .eq("user_id", user.id);

    if (enrolledError) {
      toast({
        title: "Error",
        description: "Failed to load enrolled groups",
        variant: "destructive",
      });
      return;
    }

    const enrolled = enrolledData?.map((item: any) => item.groups).filter(Boolean) || [];
    setEnrolledGroups(enrolled);

    // Fetch other public groups
    const enrolledIds = enrolled.map((g: Group) => g.id);
    const { data: otherData, error: otherError } = await supabase
      .from("groups")
      .select("id, name, emoji")
      .eq("privacy", "public")
      .not("id", "in", `(${enrolledIds.join(",")})`);

    if (otherError) {
      toast({
        title: "Error",
        description: "Failed to load other groups",
        variant: "destructive",
      });
      return;
    }

    setOtherGroups(otherData || []);
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-playful">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          ⭐ My Groups
        </h3>
        <div className="space-y-2">
          {enrolledGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No groups yet</p>
          ) : (
            enrolledGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  group.id === currentGroupId
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">{group.emoji || "📚"}</span>
                <span className="text-sm">{group.name}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-4 shadow-playful">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          🌐 Other Groups
        </h3>
        <div className="space-y-2">
          {otherGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other groups</p>
          ) : (
            otherGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="text-xl">{group.emoji || "📚"}</span>
                <span className="text-sm">{group.name}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default GroupSidebar;
