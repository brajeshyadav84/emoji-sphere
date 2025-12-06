import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Lock, Globe, UserPlus, UserMinus } from "lucide-react";
import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import GroupSidebar from "@/components/GroupSidebar";
import AdvertisementSpace from "@/components/AdvertisementSpace";
import { useGetAllGroupPostsQuery } from "@/store/api/groupPostApi";
import { useGetGroupByIdQuery, useJoinGroupMutation, useLeaveGroupMutation } from "@/store/api/groupsApi";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import PostsFeedSwitcher from "@/components/PostsFeedSwitcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch group details
  const { data: groupData, isLoading: isLoadingGroup } = useGetGroupByIdQuery(Number(groupId), {
    skip: !groupId,
  });

  const {
    data: postsData,
    isLoading,
    refetch
  } = useGetAllGroupPostsQuery({ groupId: Number(groupId), page: 0, size: 3 }, {
    skip: !groupId,
  });
  
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Ensure we fetch posts whenever the page is landed on or groupId changes
  useEffect(() => {
    if (groupId) {
      // refetch ensures a network request happens even if cached data exists
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const group = groupData?.data;
  const isUserMember = group?.isUserMember || false;

  const handleJoinGroup = async () => {
    if (!groupId) return;
    
    try {
      const result = await joinGroup({ groupId: Number(groupId) }).unwrap();
      toast({
        title: "Success",
        description: result.message || "You have successfully joined the group!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to join group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    try {
      const result = await leaveGroup(Number(groupId)).unwrap();
      toast({
        title: "Success",
        description: result.message || "You have successfully left the group!",
      });
      setShowLeaveDialog(false);
      // Optionally navigate back to groups page
      // navigate("/groups");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to leave group. Please try again.",
        variant: "destructive",
      });
      setShowLeaveDialog(false);
    }
  };

  if (isLoadingGroup) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <p className="text-center">Loading group...</p>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Button
            onClick={() => navigate("/groups")}
            variant="ghost"
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to groups
          </Button>
          <p className="text-center text-muted-foreground">Group not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Button
          onClick={() => navigate("/groups")}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to groups
        </Button>
        
        <div className="mb-6 flex items-start gap-4">
          <div className="text-5xl">{group.emoji || "📚"}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
              {group.privacy === "PRIVATE" ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
              {!isUserMember ? (
                <Button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="gap-2 bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                  {isJoining ? "Joining..." : "Join Group"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowLeaveDialog(true)}
                  disabled={isLeaving}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  size="sm"
                >
                  <UserMinus className="h-4 w-4" />
                  Leave Group
                </Button>
              )}
            </div>
            {/* {group.description && (
              <p className="text-muted-foreground mb-2">{group.description}</p>
            )} */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{group.memberCount || 0} members</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 hidden lg:block">
            <GroupSidebar currentGroupId={groupId} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            {!isUserMember && (
              <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
                <div className="text-4xl">🔒</div>
                <h3 className="text-lg font-semibold text-foreground">Join to Participate</h3>
                <p className="text-sm text-muted-foreground">
                  You need to join this group to create posts and interact with members.
                </p>
                <Button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4" />
                  {isJoining ? "Joining..." : "Join Group Now"}
                </Button>
              </div>
            )}
            <CreatePost fromGroup={true} disabled={!isUserMember} />
            {/* Posts feed with switching capability between regular and stored procedure */}
            <PostsFeedSwitcher fromGroup={true} />
          </div>

          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20">
              <AdvertisementSpace />
            </div>
          </div>
        </div>
      </main>

      {/* Leave Group Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave Group?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong>{group?.name}</strong>? You won't be able to see posts or participate until you join again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              disabled={isLeaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveGroup}
              disabled={isLeaving}
              className="gap-2"
            >
              <UserMinus className="h-4 w-4" />
              {isLeaving ? "Leaving..." : "Leave Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupPage;
