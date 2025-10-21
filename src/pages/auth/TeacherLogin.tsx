import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Loader2, GraduationCap, BookOpen } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { loginSuccess } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

const teacherLoginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be less than 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

type TeacherLoginFormValues = z.infer<typeof teacherLoginSchema>;

export default function TeacherLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [login] = useLoginMutation();

  const form = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'TEACHER') {
      navigate("/teacher-dashboard");
    } else if (isAuthenticated && user?.role === 'ADMIN') {
      navigate("/admin");
    } else if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (values: TeacherLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login({
        mobile: values.mobile,
        password: values.password,
      }).unwrap();

  const raw = response as any;
  const data = (raw && (raw.data ?? raw)) as any;

  // Check if user has teacher role
  if (data?.role !== 'TEACHER') {
        toast({
          title: "Access Denied",
          description: "Only teachers can access this portal. Please use the regular login for users or admin login for administrators.",
          variant: "destructive",
        });
        return;
      }

      // Dispatch login success action
      dispatch(loginSuccess({ ...(data || {}) }));

      toast({
        title: "Welcome Teacher!",
        description: "You have successfully logged in to the teacher portal.",
      });

      // Navigate to teacher dashboard (create this route if it doesn't exist)
      navigate("/teacher-dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.data?.message || "Invalid mobile number or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
            Teacher Portal
          </h1>
          <p className="text-blue-700 dark:text-blue-300 mt-2">
            Teacher access only
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Teacher Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                        disabled={isLoading}
                        className="border-blue-200 focus:border-blue-500 dark:border-blue-700"
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
                    <FormLabel>Teacher Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your teacher password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="border-blue-200 focus:border-blue-500 dark:border-blue-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Teacher Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Need a teacher account? </span>
              <Link to="/auth/teacher-register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium">
                Teacher Registration
              </Link>
            </div>
            
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4 space-y-1">
              <div>
                <span className="text-muted-foreground">Regular user? </span>
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  User Login
                </Link>
              </div>
              <div>
                <span className="text-muted-foreground">Administrator? </span>
                <Link to="/auth/admin-login" className="text-red-600 hover:text-red-700 hover:underline font-medium">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}