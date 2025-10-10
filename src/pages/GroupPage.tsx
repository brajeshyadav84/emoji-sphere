import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import GroupSidebar from "@/components/GroupSidebar";
import AdvertisementSpace from "@/components/AdvertisementSpace";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string; // Add user_id field
  profiles: {
    name: string;
  };
  post_likes: { id: string }[];
  post_comments: { id: string }[];
}

const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchPosts();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    } else if (data) {
      setGroupName(data.name);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        user_id,
        post_likes (id),
        post_comments (id)
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch profile names separately
    if (data && data.length > 0) {
      const userIds = data.map(post => post.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const postsWithProfiles = data.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { name: "Unknown" }
      }));

      setPosts(postsWithProfiles as any);
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

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
            <CreatePost groupId={groupId} onPostCreated={handlePostCreated} />
            
            {loading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet. Be the first to share something!
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  author={post.profiles?.name || "Unknown"}
                  avatar="👤"
                  time={new Date(post.created_at).toLocaleDateString()}
                  content={post.content}
                  likes={post.post_likes?.length || 0}
                  comments={post.post_comments?.length || 0}
                  userId={post.user_id}
                  onUpdate={fetchPosts}
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
