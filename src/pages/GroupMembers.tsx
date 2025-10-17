import { useState, useMemo } from "react";
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

import { useGetGroupMembersQuery, useRemoveMemberMutation } from "@/store/api/groupsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { calcAge } from "@/utils/dob";

interface Member {
  id: number;
  name: string;
  age: number;
  joinedDate: string;
  email?: string;
  mobileNumber?: string;
}

const GroupMembers = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<number | "bulk" | null>(null);
  


  // Fetch group members from API
  const groupIdNum = groupId ? Number(groupId) : undefined;
  const { data, isLoading, isError, refetch } = useGetGroupMembersQuery(
    groupIdNum ? { groupId: groupIdNum, page: 0, size: 100 } : skipToken
  );

  // Remove member mutation
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  // Map API data to Member[] for UI
  const members: Member[] = useMemo(() => {
    if (!data?.success || !data.data?.content) return [];
    return data.data.content.map((m: any) => ({
      id: m.id,
      name: [m.firstName, m.lastName].filter(Boolean).join(" ") || m.mobileNumber || m.email || "Unknown",
      age: m.dob ? calcAge(m.dob) : 0,
      joinedDate: m.joinedAt,
      email: m.email,
      mobileNumber: m.mobileNumber,
    }));
  }, [data]);

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [members, searchQuery]
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


  // Remove member(s) from group
  const confirmDelete = async () => {
    if (!groupIdNum) {
      toast({
        title: "Invalid group",
        description: "Group ID is missing.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }

    // Single member delete
    if (typeof deleteTarget === "number") {
      try {
        const result = await removeMember({ groupId: groupIdNum, memberId: String(deleteTarget) }).unwrap();
        if (result.success) {
          toast({
            title: "Member removed",
            description: "The member has been removed from the group.",
            variant: "default",
          });
          refetch();
        } else {
          toast({
            title: "Failed to remove member",
            description: result.message || "Unknown error.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error removing member",
          description: err?.data?.message || err?.message || "Unknown error.",
          variant: "destructive",
        });
      }
      setDeleteTarget(null);
      return;
    }

    // Bulk delete
    if (deleteTarget === "bulk") {
      let successCount = 0;
      let failCount = 0;
      for (const memberId of selectedMembers) {
        try {
          const result = await removeMember({ groupId: groupIdNum, memberId: String(memberId) }).unwrap();
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }
      toast({
        title: `Bulk removal complete`,
        description: `${successCount} removed, ${failCount} failed.`,
        variant: failCount === 0 ? "default" : "destructive",
      });
      setSelectedMembers([]);
      refetch();
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading members...</div>;
  }
  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-destructive">Failed to load members. <Button onClick={() => refetch()}>Retry</Button></div>;
  }

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
                      <h3 className="font-semibold">
                        {member.name}
                        {member.email && (
                          <>
                            {" ("}
                            <a
                              href={`mailto:${member.email}`}
                              className="text-primary underline hover:text-primary/80 ml-1"
                              title={`Send email to ${member.email}`}
                              onClick={e => e.stopPropagation()}
                            >
                              {member.email}
                            </a>
                            {" )"}
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Mobile:
                        {member.mobileNumber ? (
                          <a
                            href={`https://wa.me/${member.mobileNumber.replace(/[^\d]/g, "")}`}
                            className="text-primary underline hover:text-primary/80 ml-1"
                            title={`Chat on WhatsApp: ${member.mobileNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            {member.mobileNumber}
                          </a>
                        ) : (
                          <span className="ml-1">N/A</span>
                        )}
                        {" • Joined: "}{new Date(member.joinedDate).toLocaleDateString()}
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
