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
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HolidayAssignments = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Summer Reading Project",
      grade: 3,
      type: "summer",
      dueDate: "2025-08-31",
      description: "Read 3 books and write a short summary",
      active: true,
    },
    {
      id: 2,
      title: "Winter Science Experiment",
      grade: 4,
      type: "winter",
      dueDate: "2025-12-20",
      description: "Conduct a simple science experiment at home",
      active: true,
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gradeLevel: "1",
    holidayType: "summer",
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Assignment created successfully!");
    setShowCreateForm(false);
    setFormData({
      title: "",
      description: "",
      gradeLevel: "1",
      holidayType: "summer",
      dueDate: "",
    });
  };

  const handleDelete = (id: number) => {
    setAssignments(assignments.filter((a) => a.id !== id));
    toast.success("Assignment deleted successfully!");
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
              <span className="gradient-text-primary">Holiday Assignments</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Create summer and winter holiday tasks
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gradient-secondary gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Assignment
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-8 shadow-playful">
            <h2 className="text-2xl font-bold mb-4">Create Holiday Assignment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter assignment title"
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
                  <Label htmlFor="holidayType">Holiday Type</Label>
                  <Select
                    value={formData.holidayType}
                    onValueChange={(value) => setFormData({ ...formData, holidayType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select holiday type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">☀️ Summer</SelectItem>
                      <SelectItem value="winter">❄️ Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  placeholder="Describe the assignment"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="gradient-success">
                  Create Assignment
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

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Summer Assignments ☀️</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {assignments
              .filter((a) => a.type === "summer")
              .map((assignment) => (
                <Card key={assignment.id} className="p-6 shadow-playful">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span>Grade {assignment.grade}</span>
                        <span className="text-muted-foreground">•</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.active
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {assignment.active ? "Active" : "Inactive"}
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
                        onClick={() => handleDelete(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          <h2 className="text-2xl font-bold mt-8">Winter Assignments ❄️</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments
              .filter((a) => a.type === "winter")
              .map((assignment) => (
                <Card key={assignment.id} className="p-6 shadow-playful">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span>Grade {assignment.grade}</span>
                        <span className="text-muted-foreground">•</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.active
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {assignment.active ? "Active" : "Inactive"}
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
                        onClick={() => handleDelete(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HolidayAssignments;