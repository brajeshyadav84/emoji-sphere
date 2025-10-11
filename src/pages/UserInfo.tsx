import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaUserMinus, 
  FaComment, 
  FaTimes, 
  FaCheck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSchool,
  FaUsers
} from 'react-icons/fa';
import { 
  useGetUserProfileQuery,
  useGetFriendshipStatusQuery,
  useSendFriendRequestByIdMutation,
  useRespondToFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetUserGroupsQuery
} from '../store/api/userApi';
import { useGetUserPostsByIdQuery } from '../store/api/postsApi';
import { getAvatarByGender } from '../utils/avatarUtils';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useToast } from '../hooks/use-toast';

const UserInfo: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [showSharePost, setShowSharePost] = useState(false);
  const { toast } = useToast();

  // Get current user from localStorage or auth state
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isOwnProfile = currentUser?.id === parseInt(userId || '0');

  // API calls using RTK Query
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useGetUserProfileQuery(userId || '', {
    skip: !userId
  });

  const { 
    data: friendshipStatus, 
    isLoading: friendshipLoading 
  } = useGetFriendshipStatusQuery({ userId: userId || '' }, {
    skip: !userId || isOwnProfile
  });

  const { 
    data: userPosts, 
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts 
  } = useGetUserPostsByIdQuery({
    userId: userId || '',
    page: currentPage,
    size: 10
  }, {
    skip: !userId
  });

  const { 
    data: userGroups, 
    isLoading: groupsLoading 
  } = useGetUserGroupsQuery(userId || '', {
    skip: !userId || !isOwnProfile // Only show groups for own profile for now
  });

  // Mutations
  const [sendFriendRequest] = useSendFriendRequestByIdMutation();
  const [respondToRequest] = useRespondToFriendRequestMutation();
  const [cancelRequest] = useCancelFriendRequestMutation();

  const handleFriendAction = async (action: string) => {
    if (!userId) return;

    try {
      switch (action) {
        case 'add':
          await sendFriendRequest({ targetUserId: userId }).unwrap();
          toast({
            title: "Success",
            description: "Friend request sent successfully!",
          });
          break;
        case 'accept':
          if (friendshipStatus?.friendship?.id) {
            await respondToRequest({ 
              friendshipId: friendshipStatus.friendship.id, 
              response: 'ACCEPTED' 
            }).unwrap();
            toast({
              title: "Success",
              description: "Friend request accepted!",
            });
          }
          break;
        case 'decline':
          if (friendshipStatus?.friendship?.id) {
            await respondToRequest({ 
              friendshipId: friendshipStatus.friendship.id, 
              response: 'DECLINED' 
            }).unwrap();
            toast({
              title: "Success",
              description: "Friend request declined.",
            });
          }
          break;
        case 'cancel':
          await cancelRequest({ friendId: userId }).unwrap();
          toast({
            title: "Success",
            description: "Friend request cancelled.",
          });
          break;
      }
    } catch (error: any) {
      console.error('Friend action failed:', error);
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to perform friend action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;
    
    if (friendshipLoading) {
      return (
        <div className="px-3 py-2 bg-secondary/20 text-muted-foreground rounded-lg text-sm">
          Loading...
        </div>
      );
    }

    const friendship = friendshipStatus?.friendship;
    
    if (!friendship) {
      // No friendship exists - show Add Friend button
      return (
        <button
          onClick={() => handleFriendAction('add')}
          className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <FaUserPlus className="mr-2" />
          Add Friend
        </button>
      );
    }

    switch (friendship.status) {
      case 'PENDING':
        if (friendship.isSentByCurrentUser) {
          // Current user sent the request - show Cancel button
          return (
            <button
              onClick={() => handleFriendAction('cancel')}
              className="flex items-center px-3 py-2 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              <FaTimes className="mr-2" />
              Cancel Request
            </button>
          );
        } else {
          // Current user received the request - show Accept/Decline buttons
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleFriendAction('accept')}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <FaCheck className="mr-1" />
                Accept
              </button>
              <button
                onClick={() => handleFriendAction('decline')}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <FaTimes className="mr-1" />
                Decline
              </button>
            </div>
          );
        }
      case 'ACCEPTED':
        // Friends - show Message and Remove buttons
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/chat', { 
                state: { 
                  selectedFriend: {
                    id: userProfile.id,
                    name: userProfile.fullName,
                    gender: userProfile.gender
                  }
                }
              })}
              className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <FaComment className="mr-2" />
              Message
            </button>
            <button
              onClick={() => handleFriendAction('cancel')}
              className="flex items-center px-3 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <FaUserMinus className="mr-1" />
              Remove
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
            <div className="lg:col-span-3 hidden lg:block">
              <Sidebar />
            </div>
            <div className="lg:col-span-6 space-y-3 md:space-y-6 min-w-0 w-full">
              <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-6">
                <div className="text-center text-muted-foreground">Loading user profile...</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (profileError || !userProfile) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
            <div className="lg:col-span-3 hidden lg:block">
              <Sidebar />
            </div>
            <div className="lg:col-span-6 space-y-3 md:space-y-6 min-w-0 w-full">
              <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-6 text-center">
                <div className="text-red-500 mb-4">
                  User not found or error loading profile.
                </div>
                <button 
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
          <div className="lg:col-span-3 hidden lg:block">
            <Sidebar />
          </div>

          <div className="lg:col-span-6 space-y-3 md:space-y-6 min-w-0 w-full">
            
            {/* User Profile Header */}
            <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-6">
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {userProfile.fullName}
                  </h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center text-muted-foreground text-sm">
                      <FaMapMarkerAlt className="mr-2 text-purple-500" />
                      <span>{userProfile.country}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <FaCalendarAlt className="mr-2 text-purple-500" />
                      <span>{userProfile.age} years old</span>
                    </div>
                    {userProfile.schoolName && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <FaSchool className="mr-2 text-purple-500" />
                        <span>{userProfile.schoolName}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground text-sm">
                      <span className="mr-2">👤</span>
                      <span className="capitalize">{userProfile.gender}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {userProfile.isVerified && (
                      <span className="flex items-center text-green-600 text-sm">
                        <FaCheck className="mr-1" />
                        Verified
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm">
                      Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex-shrink-0">
                  {renderFriendButton()}
                </div>
              </div>
            </div>

            {/* Share Post Section (only for own profile) */}
            {isOwnProfile && (
              <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-4">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  ✨ Share a Post
                </h3>
                <button
                  onClick={() => setShowSharePost(!showSharePost)}
                  className="w-full p-3 bg-secondary/10 rounded-lg text-left text-muted-foreground hover:bg-secondary/20 transition-colors text-sm"
                >
                  What's on your mind? Share something nice! 🌟
                </button>
                
                {showSharePost && (
                  <div className="mt-4">
                    <CreatePost onPostCreated={() => setShowSharePost(false)} />
                  </div>
                )}
              </div>
            )}
            
            {/* Posts Feed */}
            <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-4">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                📝 {isOwnProfile ? 'My Posts' : `${userProfile.fullName}'s Posts`}
              </h3>
              
              {postsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
              ) : postsError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load posts
                </div>
              ) : userPosts?.content && userPosts.content.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.content.map((post) => {
                    console.log('Post data:', post); // Debug log
                    return (
                      <PostCard 
                        key={post.id} 
                        postId={post.id}
                        author={post.author.fullName || post.author.name}
                        avatar={getAvatarByGender(post.author.gender)}
                        time={new Date(post.createdAt).toLocaleDateString()}
                        content={post.content}
                        likes={post.likesCount}
                        comments={post.commentsCount}
                        userId={post.author.id.toString()}
                        userGender={post.author.gender}
                        isLikedByCurrentUser={post.isLikedByCurrentUser}
                        onUpdate={refetchPosts}
                      />
                    );
                  })}
                  
                  {/* Load More Button */}
                  {!userPosts.last && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        Load More Posts
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isOwnProfile ? 
                    "You haven't shared any posts yet." : 
                    `${userProfile.fullName} hasn't shared any posts yet.`
                  }
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Groups and Info */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20 space-y-4">
              
              {/* Profile Stats */}
              <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-4">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  📊 Profile Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Posts</span>
                    <span className="font-semibold text-foreground">{userPosts?.totalElements || 0}</span>
                  </div>
                  {isOwnProfile && userGroups && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Groups</span>
                      <span className="font-semibold text-foreground">{userGroups.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Member Since</span>
                    <span className="font-semibold text-foreground text-sm">
                      {new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Groups */}
              <div className="bg-card rounded-2xl shadow-playful border-2 border-secondary/20 p-4">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  {isOwnProfile ? 'My Groups' : 'Groups'}
                </h3>
                
                {groupsLoading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">Loading groups...</div>
                ) : userGroups && userGroups.length > 0 ? (
                  <div className="space-y-2">
                    {userGroups.map((group) => (
                      <div 
                        key={group.id}
                        className="p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        <h4 className="font-semibold text-foreground text-sm">{group.name}</h4>
                        <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {isOwnProfile ? "You haven't joined any groups yet." : "No groups to show."}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserInfo;