import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, UserMinus, Search, Check, X } from 'lucide-react';
import { useGetFriendsQuery, useSendFriendRequestByIdMutation, useRemoveFriendMutation, useRespondToFriendRequestMutation } from '@/store/api/userApi';

interface FriendsManagementProps {
  // No props needed since we're using current user's friends
}

const FriendsManagement: React.FC<FriendsManagementProps> = () => {
  const { toast } = useToast();
  
  // Get friends from API
  const { data: friendsResponse, isLoading: friendsLoading, error: friendsError } = useGetFriendsQuery({ page: 0, size: 50 });
  
  const [sendFriendRequest, { isLoading: isSending }] = useSendFriendRequestByIdMutation();
  const [removeFriend, { isLoading: isRemoving }] = useRemoveFriendMutation();
  const [respondToFriendRequest, { isLoading: isResponding }] = useRespondToFriendRequestMutation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendId, setNewFriendId] = useState('');

  // Extract friends from API response
  const friends = friendsResponse?.friends || [];
  const filteredFriends = friends.filter(friend =>
    friend.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendFriendRequest = async () => {
    if (!newFriendId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid friend ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendFriendRequest({
        targetUserId: newFriendId.trim()
      }).unwrap();
      
      setNewFriendId('');
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: number, friendName: string) => {
    try {
      await removeFriend({
        friendId: friendId.toString()
      }).unwrap();
      
      toast({
        title: "Friend Removed",
        description: `${friendName} has been removed from your friends list.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove friend. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptFriendRequest = async (friendshipId: number, friendName: string) => {
    try {
      await respondToFriendRequest({
        friendshipId,
        response: 'ACCEPTED'
      }).unwrap();
      
      toast({
        title: "Friend Request Accepted",
        description: `You are now friends with ${friendName}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineFriendRequest = async (friendshipId: number, friendName: string) => {
    try {
      await respondToFriendRequest({
        friendshipId,
        response: 'DECLINED'
      }).unwrap();
      
      toast({
        title: "Friend Request Declined",
        description: `Friend request from ${friendName} has been declined.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to decline friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACCEPTED: { variant: 'default' as const, text: 'Friends' },
      PENDING: { variant: 'secondary' as const, text: 'Pending' },
      BLOCKED: { variant: 'destructive' as const, text: 'Blocked' },
      DECLINED: { variant: 'outline' as const, text: 'Declined' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (friendsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Friends Management
          <Badge variant="outline" className="ml-auto">
            {friends?.filter(f => f.status === 'ACCEPTED').length || 0} Friends
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Friend */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Friend
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter friend's ID or username"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
            />
            <Button onClick={handleSendFriendRequest} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>

        {/* Search Friends */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Error handling */}
        {friendsError && (
          <div className="text-center py-4 text-red-500">
            <p>Failed to load friends list</p>
            <p className="text-sm">Please try refreshing the page</p>
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-3">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {friends?.length === 0 ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No friends yet</p>
                  <p className="text-sm">Start by adding some friends!</p>
                </>
              ) : (
                <p>No friends match your search</p>
              )}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {friend.otherUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{friend.otherUser.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {friend.otherUser.age} years old • {friend.otherUser.country}
                      {friend.otherUser.schoolName && ` • ${friend.otherUser.schoolName}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(friend.status)}
                      {friend.status === 'PENDING' && friend.isSentByCurrentUser && (
                        <span className="text-xs text-gray-500">Request sent</span>
                      )}
                      {friend.status === 'PENDING' && friend.canRespond && (
                        <span className="text-xs text-blue-600">Can respond</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons based on friendship status */}
                <div className="flex items-center gap-2">
                  {friend.status === 'PENDING' && friend.canRespond && (
                    <>
                      <Button 
                        onClick={() => handleAcceptFriendRequest(friend.id, friend.otherUser.fullName)}
                        disabled={isResponding}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        onClick={() => handleDeclineFriendRequest(friend.id, friend.otherUser.fullName)}
                        disabled={isResponding}
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {friend.status === 'ACCEPTED' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {friend.otherUser.fullName} from your friends list? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveFriend(friend.otherUserId, friend.otherUser.fullName)}
                            disabled={isRemoving}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isRemoving ? 'Removing...' : 'Remove Friend'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Friend Requests Summary */}
        {friends && friends.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {friends.filter(f => f.status === 'ACCEPTED').length}
              </p>
              <p className="text-sm text-gray-500">Friends</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {friends.filter(f => f.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {friends.filter(f => f.status === 'BLOCKED').length}
              </p>
              <p className="text-sm text-gray-500">Blocked</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsManagement;