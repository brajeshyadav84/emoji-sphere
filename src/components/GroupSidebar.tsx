import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { useGetUserGroupsQuery, useGetGroupRecommendationsQuery } from "@/store/api/groupsApi";

interface GroupSidebarProps {
  currentGroupId?: string;
}

const GroupSidebar = ({ currentGroupId }: GroupSidebarProps) => {
  const navigate = useNavigate();
  
  // Fetch user's groups (groups the user has joined)
  const { data: userGroupsData, isLoading: isLoadingMyGroups } = useGetUserGroupsQuery();
  
  // Fetch other recommended groups
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useGetGroupRecommendationsQuery(10);

  const myGroups = userGroupsData?.data || [];
  const otherGroups = recommendationsData?.data || [];

  const handleGroupClick = (groupId: number) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-playful">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          ⭐ My Groups
        </h3>
        <div className="space-y-2">
          {isLoadingMyGroups ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : myGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No groups yet</p>
          ) : (
            myGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  group.id.toString() === currentGroupId
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

      {/* <Card className="p-4 shadow-playful">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          🌐 Other Groups
        </h3>
        <div className="space-y-2">
          {isLoadingRecommendations ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : otherGroups.length === 0 ? (
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
      </Card> */}
    </div>
  );
};

export default GroupSidebar;
