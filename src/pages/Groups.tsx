import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Lock, Globe, Settings, Crown, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import {
  useGetUserGroupsQuery,
  useGetGroupRecommendationsQuery,
  useJoinGroupMutation,
} from "@/store/api/groupsApi";

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: userGroupsData, isLoading: isLoadingUserGroups } = useGetUserGroupsQuery();
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useGetGroupRecommendationsQuery(8);
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();

  const myGroups = userGroupsData?.data || [];
  const suggestedGroups = recommendationsData?.data || [];
  const isAdmin = user?.role === 'ADMIN';

  const handleJoinGroup = async (groupId: number) => {
    try {
      const result = await joinGroup({ groupId }).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to join group',
        variant: 'destructive',
      });
    }
  };

  const renderGroupCard = (group: any, isMember = false) => (
    <Card
      key={group.id}
      className="p-4 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 w-full max-w-full"
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="text-3xl md:text-5xl">{group.emoji || '🌟'}</div>
        <div className="flex items-center gap-2">
          {group.privacy === "PRIVATE" ? (
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          ) : (
            <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          )}
          {group.isUserAdmin && <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />}
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold mb-2">{group.name}</h3>
      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">{group.description}</p>

      <div className="flex items-center gap-2 mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
        <Users className="h-3 w-3 md:h-4 md:w-4" />
        <span>{group.memberCount || 0} members</span>
        {group.isUserAdmin && (
          <>
            <span>•</span>
            <Crown className="h-3 w-3 md:h-4 md:w-4" />
            <span>Admin</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 text-xs md:text-sm"
          size="sm"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          View Group
        </Button>
        {isMember && group.isUserAdmin ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/groups/${group.id}/members`)}
            title="Manage Members"
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        ) : !isMember ? (
          <Button
            onClick={() => handleJoinGroup(group.id)}
            disabled={isJoining}
            size="sm"
            className="gradient-primary font-semibold text-xs md:text-sm"
          >
            <UserPlus className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            Join
          </Button>
        ) : null}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
        <div className="mx-auto px-1 md:px-0">
          <div className="px-2 md:px-0">
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  <span className="gradient-text-primary">My Groups</span> 👥
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Join groups and connect with friends who share your interests!
                </p>
              </div>
            </div>
            
            <section className="mb-6 md:mb-8 lg:mb-12">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Your Groups</h2>
              {isLoadingUserGroups ? (
                <div className="text-center py-8 text-muted-foreground">Loading your groups...</div>
              ) : myGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">You haven't joined any groups yet.</p>
                  {isAdmin ? (
                    <Button 
                      onClick={() => navigate('/groups/manage')}
                      className="gradient-primary font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Group
                    </Button>
                  ) : (
                    <p className="text-sm">Browse suggested groups below to join!</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {myGroups.map((group) => renderGroupCard(group, true))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Suggested Groups</h2>
              {isLoadingRecommendations ? (
                <div className="text-center py-8 text-muted-foreground">Loading recommendations...</div>
              ) : suggestedGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No group recommendations available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  {suggestedGroups.map((group) => renderGroupCard(group, false))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;
