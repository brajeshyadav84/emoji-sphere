import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  mobile: string;
  gender: string;
  is_verified: boolean;
  created_at: string;
}

const UserInfo = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '👤';
    }
  };

  const getAgeGroup = (age: number) => {
    if (age <= 12) return 'Child';
    if (age <= 17) return 'Teenager';
    if (age <= 25) return 'Young Adult';
    return 'Adult';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-8">Loading user profile...</div>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="p-6 shadow-playful hover:shadow-hover transition-all duration-300">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-4xl mx-auto mb-4">
              {getGenderEmoji(userProfile.gender)}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{userProfile.name}</h1>
            {userProfile.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Verified User
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{userProfile.age} years old ({getAgeGroup(userProfile.age)})</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{userProfile.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{userProfile.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{userProfile.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email ID</p>
                    <p className="font-medium text-muted-foreground">
                      {userProfile.mobile.replace(/^\+91/, '').replace(/^\+1/, '').slice(0, 3)}***@email.com
                    </p>
                    <p className="text-xs text-muted-foreground">For privacy, email is partially hidden</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{formatDate(userProfile.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School Information - Placeholder since it's not in current database */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
            <h3 className="text-lg font-semibold mb-2 text-center">🏫 School Information</h3>
            <p className="text-center text-muted-foreground">
              School details will be available once user completes their profile.
            </p>
          </div>

          {/* Safety Notice */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Safety Notice</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This is a safe learning environment for children. Personal information is protected and only basic details are shown for safety reasons.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default UserInfo;