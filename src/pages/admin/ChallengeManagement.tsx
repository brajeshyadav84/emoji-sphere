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
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChallengeManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "Reading Challenge",
      grade: 3,
      date: "2025-10-15",
      points: 10,
      description: "Read 5 pages of your favorite book",
    },
    {
      id: 2,
      title: "Math Practice",
      grade: 4,
      date: "2025-10-16",
      points: 15,
      description: "Complete 10 addition problems",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gradeLevel: "1",
    challengeDate: "",
    points: "10",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Challenge created successfully!");
    setShowCreateForm(false);
    setFormData({
      title: "",
      description: "",
      gradeLevel: "1",
      challengeDate: "",
      points: "10",
    });
  };

  const handleDelete = (id: number) => {
    setChallenges(challenges.filter((c) => c.id !== id));
    toast.success("Challenge deleted successfully!");
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
                  <span className="gradient-text-primary">Daily Challenges</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Create grade-wise daily challenges
                </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gradient-secondary gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Challenge
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-8 shadow-playful">
            <h2 className="text-2xl font-bold mb-4">Create Daily Challenge</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter challenge title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
                        <SelectItem key={grade} value={String(grade)}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="challengeDate">Challenge Date</Label>
                  <Input
                    id="challengeDate"
                    type="date"
                    value={formData.challengeDate}
                    onChange={(e) =>
                      setFormData({ ...formData, challengeDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="Enter points"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the challenge"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-success">
                  Create Challenge
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 shadow-playful">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {challenge.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{challenge.date}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span>Grade {challenge.grade}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-semibold">
                      {challenge.points} points
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setDeleteTarget(challenge.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              This will permanently delete the challenge. This action cannot be undone.
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

export default ChallengeManagement;