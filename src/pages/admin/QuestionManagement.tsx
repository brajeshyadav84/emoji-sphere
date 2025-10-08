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
import { getAllQuestions } from "@/utils/questions";
import YouTubeModal from "@/components/YouTubeModal";
import type { Question } from "@/types";

const QuestionManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [questions] = useState<Question[]>(getAllQuestions());
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Science",
    difficulty: "Easy",
    date: "",
    videoId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Question created successfully!");
    setShowCreateForm(false);
    setFormData({
      question: "",
      answer: "",
      category: "Science",
      difficulty: "Easy",
      date: "",
      videoId: "",
    });
  };

  const handleDelete = (id: number) => {
    toast.success("Question deleted successfully!");
    setDeleteTarget(null);
  };

  const categories = [
    "Astronomy", "Art", "Science", "Geography", "Physics", 
    "Literature", "Biology", "History", "Mathematics", "Technology"
  ];

  const difficulties = ["Easy", "Medium", "Hard"];

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Astronomy': '🚀',
      'Art': '🎨',
      'Science': '🔬',
      'Geography': '🌍',
      'Physics': '⚡',
      'Literature': '📚',
      'Biology': '🧬',
      'History': '📜',
      'Mathematics': '🔢',
      'Technology': '💻',
    };
    return emojiMap[category] || '🤔';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      'Easy': 'text-green-500 bg-green-50',
      'Medium': 'text-yellow-600 bg-yellow-50',
      'Hard': 'text-red-500 bg-red-50',
    };
    return colorMap[difficulty] || 'text-gray-500 bg-gray-50';
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
                  <span className="gradient-text-primary">Daily Questions</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Manage daily knowledge questions for kids
                </p>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gradient-secondary gap-2 text-sm md:text-base w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                Add Question
              </Button>
            </div>

        {showCreateForm && (
          <Card className="p-4 md:p-6 mb-6 md:mb-8 shadow-playful">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Create Daily Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryEmoji(category)} {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="videoId">YouTube Video ID (Optional)</Label>
                  <Input
                    id="videoId"
                    value={formData.videoId}
                    onChange={(e) => setFormData({ ...formData, videoId: e.target.value })}
                    placeholder="e.g., PtkqwslbLY8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the detailed answer"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-success">
                  Create Question
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

        <div className="grid grid-cols-1 gap-4">
          {questions.map((question) => (
            <Card key={question.id} className="p-6 shadow-playful">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCategoryEmoji(question.category)}</span>
                    <div>
                      <h3 className="text-lg font-bold">{question.question}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{question.category}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {question.date}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {question.answer}
                  </p>
                  
                  {question.videoId && (
                    <button
                      onClick={() => {
                        setSelectedVideoId(question.videoId);
                        setSelectedVideoTitle(question.question);
                        setIsVideoModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md mt-2 transition-all duration-200 font-medium"
                    >
                      📺 Preview Video
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => setDeleteTarget(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* YouTube Video Modal */}
        <YouTubeModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoId={selectedVideoId}
          title={selectedVideoTitle}
        />
      </div>
      </div>
      </main>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question. This action cannot be undone.
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

export default QuestionManagement;