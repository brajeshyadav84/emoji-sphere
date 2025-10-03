import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";

interface Member {
  id: number;
  name: string;
  age: number;
  joinedDate: string;
}

const GroupMembers = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<number | "bulk" | null>(null);
  
  // Mock data - replace with actual data from Supabase
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "Alice Johnson", age: 12, joinedDate: "2024-01-15" },
    { id: 2, name: "Bob Smith", age: 11, joinedDate: "2024-01-20" },
    { id: 3, name: "Charlie Brown", age: 13, joinedDate: "2024-02-01" },
    { id: 4, name: "Diana Prince", age: 12, joinedDate: "2024-02-10" },
    { id: 5, name: "Ethan Hunt", age: 14, joinedDate: "2024-02-15" },
  ]);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    }
  };

  const handleDeleteSingle = (memberId: number) => {
    setDeleteTarget(memberId);
  };

  const handleDeleteBulk = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No members selected",
        description: "Please select at least one member to delete.",
        variant: "destructive",
      });
      return;
    }
    setDeleteTarget("bulk");
  };

  const confirmDelete = () => {
    if (deleteTarget === "bulk") {
      setMembers((prev) => prev.filter((m) => !selectedMembers.includes(m.id)));
      toast({
        title: "Members removed",
        description: `${selectedMembers.length} member(s) have been removed from the group.`,
      });
      setSelectedMembers([]);
    } else if (typeof deleteTarget === "number") {
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget));
      toast({
        title: "Member removed",
        description: "The member has been removed from the group.",
      });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/groups")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text-primary">Manage Members</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            View, search, and manage group members
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedMembers.length === filteredMembers.length && filteredMembers.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteBulk}
                disabled={selectedMembers.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedMembers.length})
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No members found
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleSelectMember(member.id)}
                    />
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {member.age} • Joined: {new Date(member.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSingle(member.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === "bulk"
                ? `This will remove ${selectedMembers.length} member(s) from the group. This action cannot be undone.`
                : "This will remove the member from the group. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupMembers;
