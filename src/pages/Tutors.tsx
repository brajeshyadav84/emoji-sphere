import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useGetTeacherListQuery } from "@/store/api/teacherApi";

const Tutors = () => {
  const { data: teachersData, isLoading, isError } = useGetTeacherListQuery({ page: 0, size: 10 });
  const teachers = teachersData?.data ?? [];
  const [selected, setSelected] = useState<any | null>(null);

  const getAvatar = (gender?: string) => {
    if (!gender) return "🧑‍🏫";
    const g = gender.toLowerCase();
    if (g.includes("female") || g === "female" || g === "f") return "👩‍🏫";
    if (g.includes("male") || g === "male" || g === "m") return "👨‍🏫";
    return "🧑‍🏫";
  };

  console.log("Teachers data:", teachers);

  // Fixed age calculation for DD/MM/YYYY format
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const [day, month, year] = dob.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
        <div className="mx-auto px-1 md:px-0">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              <span className="gradient-text-primary">Tutors</span> 🧑‍🏫
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Browse tutors and view their details. Click "View more" to see availability, grades and contact numbers.
            </p>
          </div>

          <section>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tutors...</div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">Failed to load tutors.</div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tutors found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {teachers.map((t) => (
                  <Card key={t.userId} className="p-4 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 w-full max-w-full">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="text-3xl md:text-5xl">{getAvatar(t.gender)}</div>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold mb-2">{t.fullName || `Tutor ${t.userId}`}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                      Age: <strong>{calculateAge(t.dob)}</strong> • Experience: <strong>{t.teachingExperience ?? 0} years</strong>
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                      Country: <strong>{t.country || 'N/A'}</strong> • School: <strong>{t.schoolName || 'N/A'}</strong>
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gradient-primary font-semibold text-xs md:text-sm"
                        onClick={() => setSelected(t)}
                      >
                        View more
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-[600px] px-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{selected?.name || 'Tutor Details'}</DialogTitle>
            <DialogDescription>
              {selected && (
                <div className="space-y-2 text-sm text-muted-foreground mt-2">
                  <div>Gender: {selected.gender || 'N/A'}</div>
                  <div>Age: {calculateAge(selected.dob)}</div>
                  <div>Country: {selected.country || 'N/A'}</div>
                  <div>Date of Birth: {selected.dob || 'N/A'}</div>
                  <div>Email: {selected.email || 'N/A'}</div>
                  <div>Experience: {selected.teachingExperience ?? 0} years</div>
                  <div>School: {selected.schoolName || 'N/A'}</div>
                  <div>Online Status: {selected.onlineStatus || 'N/A'}</div>
                  <div>Mobile: {selected.mobileNumber || 'N/A'}</div>
                  {selected.gradesSubjects && selected.gradesSubjects.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold mb-2">Subjects and Pricing</h3>
                      <table className="table-auto w-full text-left border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 px-2 py-1 text-xs">Grade</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs">Subject</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs">Pricing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.gradesSubjects.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-2 py-1 text-xs">{item.grade}</td>
                              <td className="border border-gray-300 px-2 py-1 text-xs">{item.subject}</td>
                              <td className="border border-gray-300 px-2 py-1 text-xs">{item.pricing}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
            <Button
              size="sm"
              className="gradient-primary font-semibold"
              onClick={() => {
                if (selected?.mobileNumber) {
                  const whatsappUrl = `https://wa.me/${selected.mobileNumber}`;
                  window.open(whatsappUrl, '_blank');
                }
              }}
            >
              Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutors;
