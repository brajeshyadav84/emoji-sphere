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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GroupManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
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
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-1 md:px-0">
          <div className="px-2 md:px-0">
            <Button
              onClick={() => navigate("/admin")}
              variant="ghost"
              className="mb-3 md:mb-4 gap-2 text-sm md:text-base"
              size="sm"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              Back to Dashboard
            </Button>

            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  <span className="gradient-text-primary">Group Management</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Create and manage groups for kids
                </p>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gradient-secondary gap-2 text-sm md:text-base w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                Create Group
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-4 md:p-6 mb-6 md:mb-8 shadow-playful">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Create New Group</h2>
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter group name"
                      className="text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="emoji" className="text-sm md:text-base">Emoji</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder="Choose an emoji (e.g., 🎨)"
                      className="text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the group"
                      className="text-sm md:text-base"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="privacy" className="text-sm md:text-base">Privacy Setting</Label>
                    <Select
                      value={formData.privacy}
                      onValueChange={(value) => setFormData({ ...formData, privacy: value })}
                    >
                      <SelectTrigger className="text-sm md:text-base">
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" className="gradient-success text-sm md:text-base" size="sm">
                      Create Group
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-sm md:text-base"
                      size="sm"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="p-4 md:p-6 shadow-playful">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="text-4xl md:text-5xl">{group.emoji}</div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 md:h-10 md:w-10">
                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={() => setDeleteTarget(group.id)}
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold mb-2">{group.name}</h3>
                  <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{group.members}</span>
                    </div>
                    <span className="capitalize">{group.privacy}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-3 md:mt-4 text-sm md:text-base"
                    size="sm"
                    onClick={() => navigate(`/admin/groups/${group.id}/members`)}
                  >
                    Manage Members
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and remove all members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarget && handleDelete(deleteTarget)} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupManagement;