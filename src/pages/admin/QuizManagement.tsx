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
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const QuizManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  
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
    setDeleteTarget(null);
  };

  const updateQuestion = (index: number, field: string, value: string | string[]) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
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
                  <span className="gradient-text-primary">Quiz Management</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Create quizzes with 10 questions each
                </p>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gradient-secondary gap-2 text-sm md:text-base w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                Create Quiz
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-4 md:p-6 mb-6 md:mb-8 shadow-playful">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Create New Quiz</h2>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="title" className="text-sm md:text-base">Quiz Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter quiz title"
                        className="text-sm md:text-base"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="gradeLevel" className="text-sm md:text-base">Grade Level</Label>
                      <Select
                        value={formData.gradeLevel}
                        onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                      >
                        <SelectTrigger className="text-sm md:text-base">
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
                    <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the quiz"
                      className="text-sm md:text-base"
                      rows={2}
                    />
                  </div>

                  <div className="border-t pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                      <h3 className="text-lg md:text-xl font-bold">
                        Question {currentQuestion} of 10
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={currentQuestion === 1}
                          onClick={() => setCurrentQuestion(currentQuestion - 1)}
                          className="text-xs md:text-sm"
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={currentQuestion === 10}
                          onClick={() => setCurrentQuestion(currentQuestion + 1)}
                          className="text-xs md:text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <Label className="text-sm md:text-base">Question</Label>
                        <Input
                          value={formData.questions[currentQuestion - 1].question}
                          onChange={(e) =>
                            updateQuestion(currentQuestion - 1, "question", e.target.value)
                          }
                          placeholder="Enter question"
                          className="text-sm md:text-base"
                        />
                      </div>

                      <div>
                        <Label className="text-sm md:text-base">Options</Label>
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
                            className="mt-2 text-sm md:text-base"
                          />
                        ))}
                      </div>

                      <div>
                        <Label className="text-sm md:text-base">Correct Answer</Label>
                        <Input
                          value={formData.questions[currentQuestion - 1].correctAnswer}
                          onChange={(e) =>
                            updateQuestion(currentQuestion - 1, "correctAnswer", e.target.value)
                          }
                          placeholder="Enter correct answer"
                          className="text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" className="gradient-success text-sm md:text-base" size="sm">
                      Create Quiz
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
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="p-4 md:p-6 shadow-playful">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2">{quiz.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Grade {quiz.grade} • {quiz.questions} questions
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 md:h-10 md:w-10">
                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 md:h-10 md:w-10"
                        onClick={() => setDeleteTarget(quiz.id)}
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs md:text-sm w-fit ${
                        quiz.active
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {quiz.active ? "Active" : "Inactive"}
                    </span>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm">
                      View Details
                    </Button>
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
              This will permanently delete the quiz and all its questions. This action cannot be undone.
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

export default QuizManagement;