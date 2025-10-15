import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GroupModal from '@/components/GroupModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { 
  Plus, 
  Search, 
  Settings, 
  Edit, 
  Trash2, 
  Users, 
  Lock, 
  Globe, 
  MoreVertical,
  Crown,
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useGetUserGroupsQuery,
  useGetCreatedGroupsQuery,
  useDiscoverGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupResponse
} from '@/store/api/groupsApi';

const GroupManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponse | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'created' | 'discover'>('my-groups');

  const isAdmin = user?.role === 'ADMIN';

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // API hooks
  const { data: userGroupsData, isLoading: isLoadingUserGroups, refetch: refetchUserGroups } = useGetUserGroupsQuery();
  const { data: createdGroupsData, isLoading: isLoadingCreatedGroups, refetch: refetchCreatedGroups } = useGetCreatedGroupsQuery();
  const { data: discoverGroupsData, isLoading: isLoadingDiscoverGroups, refetch: refetchDiscoverGroups } = useDiscoverGroupsQuery({ page: 0, size: 20 });
  
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const userGroups = userGroupsData?.data || [];
  const createdGroups = createdGroupsData?.data || [];
  const discoverGroups = discoverGroupsData?.data?.content || [];

  const handleCreateGroup = async (data: CreateGroupRequest) => {
    try {
      const result = await createGroup(data).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setIsCreateModalOpen(false);
        refetchUserGroups();
        refetchCreatedGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create group',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGroup = async (data: UpdateGroupRequest) => {
    if (!editingGroup) return;
    
    try {
      const result = await updateGroup({ id: editingGroup.id, ...data }).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setIsEditModalOpen(false);
        setEditingGroup(null);
        refetchUserGroups();
        refetchCreatedGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;
    
    try {
      const result = await deleteGroup(deleteGroupId).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setDeleteGroupId(null);
        refetchUserGroups();
        refetchCreatedGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      const result = await joinGroup({ groupId }).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        refetchUserGroups();
        refetchDiscoverGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to join group',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      const result = await leaveGroup(groupId).unwrap();
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        refetchUserGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to leave group',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (group: GroupResponse) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const filterGroups = (groups: GroupResponse[]) => {
    if (!searchTerm.trim()) return groups;
    return groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderGroupCard = (group: GroupResponse, showAdminActions = false) => (
    <Card key={group.id} className="p-4 shadow-playful hover:shadow-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{group.emoji || '🌟'}</div>
        <div className="flex items-center gap-2">
          {group.privacy === 'PRIVATE' ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}
          {group.isUserAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
          {showAdminActions && isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditModal(group)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/members`)}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteGroupId(group.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2">{group.name}</h3>
      {group.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{group.memberCount || 0} members</span>
        </div>
        {group.adminCount && (
          <div className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            <span>{group.adminCount} admins</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={group.privacy === 'PUBLIC' ? 'default' : 'secondary'}>
          {group.privacy.toLowerCase()}
        </Badge>
        {group.isUserAdmin && <Badge variant="outline">Admin</Badge>}
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          View Group
        </Button>
        {activeTab === 'discover' && !group.isUserMember ? (
          <Button
            onClick={() => handleJoinGroup(group.id)}
            disabled={isJoining}
            className="min-w-[80px]"
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Join
          </Button>
        ) : activeTab === 'my-groups' && group.isUserMember && !group.isUserAdmin ? (
          <Button
            variant="outline"
            onClick={() => handleLeaveGroup(group.id)}
            disabled={isLeaving}
            className="min-w-[80px]"
          >
            Leave
          </Button>
        ) : null}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text-primary">Group Management</h1>
              <p className="text-muted-foreground">
                {isAdmin ? 'Create and manage your groups' : 'Browse and join groups'}
              </p>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="gradient-primary font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'my-groups' ? 'default' : 'outline'}
              onClick={() => setActiveTab('my-groups')}
            >
              My Groups ({userGroups.length})
            </Button>
            {isAdmin && (
              <Button
                variant={activeTab === 'created' ? 'default' : 'outline'}
                onClick={() => setActiveTab('created')}
              >
                Created by Me ({createdGroups.length})
              </Button>
            )}
            <Button
              variant={activeTab === 'discover' ? 'default' : 'outline'}
              onClick={() => setActiveTab('discover')}
            >
              Discover Groups
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'my-groups' && (
            <>
              {isLoadingUserGroups ? (
                <div className="col-span-full text-center py-8">Loading your groups...</div>
              ) : filterGroups(userGroups).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No groups found matching your search.' : 'You haven\'t joined any groups yet.'}
                </div>
              ) : (
                filterGroups(userGroups).map(group => renderGroupCard(group))
              )}
            </>
          )}

          {isAdmin && activeTab === 'created' && (
            <>
              {isLoadingCreatedGroups ? (
                <div className="col-span-full text-center py-8">Loading your created groups...</div>
              ) : filterGroups(createdGroups).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No groups found matching your search.' : 'You haven\'t created any groups yet.'}
                </div>
              ) : (
                filterGroups(createdGroups).map(group => renderGroupCard(group, true))
              )}
            </>
          )}

          {activeTab === 'discover' && (
            <>
              {isLoadingDiscoverGroups ? (
                <div className="col-span-full text-center py-8">Loading groups to discover...</div>
              ) : filterGroups(discoverGroups).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No groups found matching your search.' : 'No groups available to discover.'}
                </div>
              ) : (
                filterGroups(discoverGroups).map(group => renderGroupCard(group))
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Group Modal - Only for Admins */}
      {isAdmin && (
        <GroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateGroup}
          isLoading={isCreating}
          mode="create"
        />
      )}

      {/* Edit Group Modal - Only for Admins */}
      {isAdmin && (
        <GroupModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingGroup(null);
          }}
          onSubmit={handleUpdateGroup}
          isLoading={isUpdating}
          mode="edit"
          editGroup={editingGroup}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
              All group members will be removed and all group data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupManagement;