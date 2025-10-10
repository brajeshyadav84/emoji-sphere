import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetPostsQuery, 
  useCreatePostMutation
} from "@/store/api/postsApi";
import { useTogglePostLikeMutation } from "@/store/api/commentsApi";
import Header from "@/components/Header";

const ApiTest = () => {
  const [testContent, setTestContent] = useState("");
  const { toast } = useToast();
  
  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetPostsQuery({ page: 0, size: 5 });

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [toggleLike] = useTogglePostLikeMutation();

  const handleCreateTestPost = async () => {
    if (!testContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for the test post",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPost({
        content: testContent,
        isPublic: true,
        tags: ["test", "api"],
      }).unwrap();

      toast({
        title: "Success",
        description: "Test post created successfully!",
      });

      setTestContent("");
      refetchPosts();
    } catch (error: any) {
      console.error("Error creating test post:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create test post",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const result = await toggleLike(postId).unwrap();
      toast({
        title: "Success",
        description: result.message || "Like toggled successfully!",
      });
      refetchPosts();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to toggle like",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">API Integration Test</h1>

        {/* Test Post Creation */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Post</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter test post content..."
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleCreateTestPost}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Test Post"}
            </Button>
          </div>
        </Card>

        {/* Posts Display */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <Button 
              onClick={refetchPosts}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>

          {postsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading posts...</p>
            </div>
          )}

          {postsError && (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error loading posts:</p>
              <p className="text-sm text-muted-foreground">
                {JSON.stringify(postsError, null, 2)}
              </p>
            </div>
          )}

          {postsData?.content && postsData.content.length > 0 && (
            <div className="space-y-4">
              {postsData.content.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLike(post.id)}
                      className={post.isLikedByCurrentUser ? "text-red-500" : ""}
                    >
                      ❤️ {post.likesCount}
                    </Button>
                  </div>
                  <p className="mb-2">{post.content}</p>
                  <div className="text-sm text-muted-foreground">
                    💬 {post.commentsCount} comments
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag.id} 
                          className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs mr-2"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {postsData?.content && postsData.content.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found. Create one above!</p>
            </div>
          )}
        </Card>

        {/* API Status */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="space-y-2">
            <p><strong>Backend URL:</strong> http://localhost:8081/api</p>
            <p><strong>Posts Loading:</strong> {postsLoading ? "✅" : "❌"}</p>
            <p><strong>Posts Error:</strong> {postsError ? "❌" : "✅"}</p>
            <p><strong>Posts Count:</strong> {postsData?.totalElements || 0}</p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ApiTest;