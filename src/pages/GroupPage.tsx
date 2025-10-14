import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import GroupSidebar from "@/components/GroupSidebar";
import AdvertisementSpace from "@/components/AdvertisementSpace";
import { useGetAllGroupPostsQuery } from "@/store/api/groupPostApi";
import { useToast } from "@/hooks/use-toast";
import { getAvatarByGender } from "@/utils/avatarUtils";



const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const { toast } = useToast();
  const {
    data: postsData,
    isLoading,
    refetch
  } = useGetAllGroupPostsQuery({ page: 0, size: 20 });


  // Optionally fetch group name (if not available in postsData)
  // You can add a useGetGroupByIdQuery if needed for groupName

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
        <main className="container mx-auto px-4 py-6">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">{groupName}</h1>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 hidden lg:block">
            <GroupSidebar currentGroupId={groupId} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <CreatePost fromGroup={true} />
            {isLoading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : !postsData?.content?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet. Be the first to share something!
              </div>
            ) : (
              postsData.content.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  author={post.author?.name || "Unknown"}
                  avatar={getAvatarByGender(post.author?.gender)}
                  time={new Date(post.createdAt).toLocaleDateString()}
                  content={post.content}
                  likes={post.likesCount || 0}
                  comments={post.commentsCount || 0}
                  userId={post.author?.id}
                  userGender={post.author?.gender}
                  onUpdate={refetch}
                  fromGroup={true}
                />
              ))
            )}
          </div>

          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20">
              <AdvertisementSpace />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupPage;
