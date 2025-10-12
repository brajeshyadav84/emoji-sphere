import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { useGetCurrentUserProfileQuery, useUpdateUserProfileMutation } from '@/store/api/userApi';

interface ProfileManagementProps {
  // No props needed since we're getting current user profile
}

const ProfileManagement: React.FC<ProfileManagementProps> = () => {
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetCurrentUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    country: '',
    mobileNumber: '',
    schoolName: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        country: profile.country || '',
        mobileNumber: profile.mobileNumber || '',
        schoolName: profile.schoolName || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        country: formData.country,
        schoolName: formData.schoolName
        // Note: Email is not included as it cannot be changed
        // Mobile number updates might need special handling in backend
      }).unwrap();
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter your country"
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="Enter your school/university name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">Mobile cannot be changed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Name:</span>
                <span>{profile?.fullName || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Age:</span>
                <span>{profile?.age || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Gender:</span>
                <span className="capitalize">{profile?.gender || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Country:</span>
                <span>{profile?.country || 'Not provided'}</span>
              </div>
              {profile?.schoolName && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">School:</span>
                  <span>{profile.schoolName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Mobile:</span>
                <span>{profile?.mobileNumber || 'Not provided'}</span>
              </div>
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-gray-500">✉</span>
                  <span className="font-medium">Email:</span>
                  <span>{profile.email}</span>
                  {profile?.isVerified && (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 text-gray-500">📅</span>
                <span className="font-medium">Member since:</span>
                <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileManagement;