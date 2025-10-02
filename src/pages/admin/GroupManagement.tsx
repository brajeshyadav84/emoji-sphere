import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Edit, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GroupManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groups, setGroups] = useState([
    { id: 1, name: "Art Lovers", emoji: "🎨", privacy: "public", members: 45 },
    { id: 2, name: "Science Squad", emoji: "🔬", privacy: "public", members: 38 },
    { id: 3, name: "Music Band", emoji: "🎵", privacy: "private", members: 52 },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    description: "",
    privacy: "public",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Group created successfully!");
    setShowCreateForm(false);
    setFormData({ name: "", emoji: "", description: "", privacy: "public" });
  };

  const handleDelete = (id: number) => {
    setGroups(groups.filter((g) => g.id !== id));
    toast.success("Group deleted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Button
          onClick={() => navigate("/admin")}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text-primary">Group Management</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Create and manage groups for kids
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gradient-secondary gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Group
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-8 shadow-playful">
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="Choose an emoji (e.g., 🎨)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the group"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="privacy">Privacy Setting</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value) => setFormData({ ...formData, privacy: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-success">
                  Create Group
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-6 shadow-playful">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{group.emoji}</div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.members}</span>
                </div>
                <span className="capitalize">{group.privacy}</span>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate(`/admin/groups/${group.id}/members`)}
              >
                Manage Members
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GroupManagement;