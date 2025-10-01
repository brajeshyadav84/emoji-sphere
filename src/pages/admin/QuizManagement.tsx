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
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const QuizManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Math Fun", grade: 3, questions: 10, active: true },
    { id: 2, title: "Science Quiz", grade: 4, questions: 10, active: true },
    { id: 3, title: "Reading Test", grade: 2, questions: 10, active: false },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gradeLevel: "1",
    questions: Array(10).fill({ question: "", options: ["", "", "", ""], correctAnswer: "" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quiz created successfully!");
    setShowCreateForm(false);
    setCurrentQuestion(1);
  };

  const handleDelete = (id: number) => {
    setQuizzes(quizzes.filter((q) => q.id !== id));
    toast.success("Quiz deleted successfully!");
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
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
            <h1 className="text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Quiz Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Create quizzes with 10 questions each
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gradient-secondary gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Quiz
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-8 shadow-playful">
            <h2 className="text-2xl font-bold mb-4">Create New Quiz</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter quiz title"
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the quiz"
                  rows={2}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Question {currentQuestion} of 10
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={currentQuestion === 1}
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={currentQuestion === 10}
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={formData.questions[currentQuestion - 1].question}
                      onChange={(e) =>
                        updateQuestion(currentQuestion - 1, "question", e.target.value)
                      }
                      placeholder="Enter question"
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
                    {[0, 1, 2, 3].map((i) => (
                      <Input
                        key={i}
                        value={formData.questions[currentQuestion - 1].options[i]}
                        onChange={(e) => {
                          const newOptions = [...formData.questions[currentQuestion - 1].options];
                          newOptions[i] = e.target.value;
                          updateQuestion(currentQuestion - 1, "options", newOptions);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="mt-2"
                      />
                    ))}
                  </div>

                  <div>
                    <Label>Correct Answer</Label>
                    <Input
                      value={formData.questions[currentQuestion - 1].correctAnswer}
                      onChange={(e) =>
                        updateQuestion(currentQuestion - 1, "correctAnswer", e.target.value)
                      }
                      placeholder="Enter correct answer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-success">
                  Create Quiz
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
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-6 shadow-playful">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Grade {quiz.grade} • {quiz.questions} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    quiz.active
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {quiz.active ? "Active" : "Inactive"}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuizManagement;