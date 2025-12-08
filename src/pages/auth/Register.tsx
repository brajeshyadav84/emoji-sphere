import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSignupMutation, useSendOtpMutation } from "@/store/api/authApi";
import { parseDob, isFuture, formatDobToDDMMYYYY, calcAge, formatInputDob, toIsoDate } from "@/utils/dob";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { countries } from "@/data/countries";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => !!parseDob(val), "Please enter a valid date in DD/MM/YYYY or use the date picker")
    .refine((val) => {
      const d = parseDob(val);
      return d ? !isFuture(d) : false;
    }, "Date of birth cannot be in the future")
    .refine((val) => {
      const d = parseDob(val);
      return d ? calcAge(d) >= 1 && calcAge(d) <= 150 : false;
    }, "Please enter a valid age derived from date of birth"),
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
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  schoolName: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length >= 2, "School/Institution name must be at least 2 characters if provided")
    .refine((val) => !val || val.length <= 200, "School/Institution name must be less than 200 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const [sendOtp] = useSendOtpMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      dob: "",
      gender: undefined,
      location: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      schoolName: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Step 1: Register the user
      const dobFormatted = formatDobToDDMMYYYY(parseDob(values.dob) as Date);

      await signup({
        fullName: values.name,
        mobile: values.mobile,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        dob: dobFormatted,
        country: values.location,
        gender: values.gender,
        schoolName: values.schoolName,
      }).unwrap();

      toast({
        title: "Registration Successful",
        description: "Account created successfully. Sending OTP to your email...",
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
          description: "Account created but failed to send OTP. Please contact support.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Extract error message from the response
      const errorMessage = error?.data?.message || error?.message || "An unexpected error occurred. Please try again.";
      
      // Handle specific error cases with user-friendly messages
      let title = "Registration Failed";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-2xl space-y-8 my-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join us today</p>
        </div>

        <div className="bg-card border rounded-lg shadow-lg p-8">
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
                  name="dob"
                  render={({ field }) => {
                    const dateInputRef = useRef<HTMLInputElement | null>(null);
                    return (
                      <FormItem>
                        <FormLabel>Date of Birth (DD/MM/YYYY)</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              {...field}
                              type="text"
                              placeholder="DD/MM/YYYY"
                              disabled={isLoading}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const formatted = formatInputDob(raw);
                                field.onChange(formatted);

                                const iso = toIsoDate(formatted);
                                if (dateInputRef.current) dateInputRef.current.value = iso ?? '';
                              }}
                            />
                            <input
                              ref={dateInputRef}
                              type="date"
                              className="absolute right-2 opacity-0 pointer-events-none"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const d = new Date(e.target.value + 'T00:00:00');
                                  field.onChange(formatDobToDDMMYYYY(d));
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="ml-2 p-2"
                              onClick={() => {
                                if (dateInputRef.current) {
                                  dateInputRef.current.focus();
                                  dateInputRef.current.showPicker?.();
                                }
                              }}
                              aria-label="Open date picker"
                            >
                              📅
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
                          placeholder="john@example.com"
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
                          placeholder="Create a strong password"
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
                    <FormLabel>School/Institution (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Name of your school or institution"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-1">
              <div>
                <span className="text-muted-foreground">Teacher? </span>
                <Link to="/auth/teacher-register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Teacher Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
