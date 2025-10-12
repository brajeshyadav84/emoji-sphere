import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSignupMutation, useSendOtpMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Crown, Shield } from "lucide-react";
import { countries } from "@/data/countries";

const adminRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  age: z
    .string()
    .min(1, "Age is required")
    .refine((val) => !isNaN(Number(val)), "Age must be a number")
    .refine((val) => Number(val) >= 21 && Number(val) <= 150, "Admin must be at least 21 years old"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
  }),
  location: z.string().min(1, "Please select a country"),
  mobile: z
    .string()
    .trim()
    .min(8, "Mobile number must be at least 8 digits")
    .max(20, "Mobile number must be less than 20 digits")
    .regex(/^[0-9]+$/, "Mobile number can only contain digits"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  schoolName: z
    .string()
    .trim()
    .min(2, "Institution name must be at least 2 characters")
    .max(200, "Institution name must be less than 200 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AdminRegisterFormValues = z.infer<typeof adminRegisterSchema>;

export default function AdminRegister() {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const [sendOtp] = useSendOtpMutation();

  const form = useForm<AdminRegisterFormValues>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: undefined,
      location: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      schoolName: "",
    },
  });

  const onSubmit = async (values: AdminRegisterFormValues) => {
    try {
      // Step 1: Register the admin user
      await signup({
        fullName: values.name,
        mobile: values.mobile,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        age: Number(values.age),
        country: values.location,
        gender: values.gender,
        schoolName: values.schoolName,
        role: ["ADMIN"], // Set admin role
      }).unwrap();

      toast({
        title: "Admin Registration Successful",
        description: "Administrator account created successfully. Sending OTP to your email...",
      });

      // Step 2: Send OTP to email
      try {
        await sendOtp({ email: values.email }).unwrap();

        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        });

        // Step 3: Navigate to OTP verification
        navigate("/auth/verify-otp", {
          state: { email: values.email },
        });
      } catch (otpError: any) {
        console.error("Send OTP error:", otpError);
        toast({
          title: "OTP Send Failed",
          description: "Admin account created but failed to send OTP. Please contact support.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Admin registration error:", error);
      
      // Extract error message from the response
      const errorMessage = error?.data?.message || error?.message || "An unexpected error occurred. Please try again.";
      
      // Handle specific error cases with user-friendly messages
      let title = "Admin Registration Failed";
      let description = errorMessage;
      
      if (errorMessage.toLowerCase().includes("mobile number is already registered")) {
        title = "Mobile Number Already Registered";
        description = `The mobile number ${values.mobile} is already registered. Please use a different mobile number or sign in to your existing account.`;
      } else if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("already")) {
        title = "Email Already Registered";
        description = `The email ${values.email} is already registered. Please use a different email address or sign in to your existing account.`;
      } else if (errorMessage.toLowerCase().includes("validation") || errorMessage.toLowerCase().includes("invalid")) {
        title = "Invalid Information";
        description = "Please check your information and try again.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 p-4">
      <div className="w-full max-w-2xl space-y-8 my-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <Crown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-red-900 dark:text-red-100">
            Admin Registration
          </h1>
          <p className="text-red-700 dark:text-red-300 mt-2">
            Create your administrator account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          disabled={isLoading}
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Minimum 21)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="25"
                          disabled={isLoading}
                          min="21"
                          max="150"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.label}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="1234567890"
                          disabled={isLoading}
                          autoComplete="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@example.com"
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create strong password"
                          disabled={isLoading}
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution/Organization</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Name of your institution or organization"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin Account...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Create Admin Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Already have an admin account? </span>
              <Link to="/auth/admin-login" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium">
                Admin Sign In
              </Link>
            </div>
            
            <div className="border-t border-red-200 dark:border-red-800 pt-4">
              <span className="text-muted-foreground">Not an administrator? </span>
              <Link to="/auth/register" className="text-primary hover:underline font-medium">
                Regular Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}