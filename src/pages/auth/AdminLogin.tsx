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
import { Loader2, Shield, Crown } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { loginSuccess } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

const adminLoginSchema = z.object({
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

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [login] = useLoginMutation();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate("/admin");
    } else if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (values: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login({
        mobile: values.mobile,
        password: values.password,
      }).unwrap();

      // Check if user has admin role
      if (response.role !== 'ADMIN') {
        toast({
          title: "Access Denied",
          description: "Only administrators can access this portal. Please use the regular login for users or teacher login for teachers.",
          variant: "destructive",
        });
        return;
      }

      // Dispatch login success action
      dispatch(loginSuccess({
        user: {
          id: response.id,
          fullName: response.fullName,
          name: response.name,
          mobile: response.mobile,
          email: response.email,
          role: response.role,
          roles: response.roles,
        },
        token: response.token,
      }));

      toast({
        title: "Welcome Administrator!",
        description: "You have successfully logged in to the admin portal.",
      });

      navigate("/admin");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <Crown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-red-900 dark:text-red-100">
            Admin Portal
          </h1>
          <p className="text-red-700 dark:text-red-300 mt-2">
            Administrator access only
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                        disabled={isLoading}
                        className="border-red-200 focus:border-red-500 dark:border-red-700"
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
                    <FormLabel>Admin Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your admin password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="border-red-200 focus:border-red-500 dark:border-red-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Need an admin account? </span>
              <Link to="/auth/admin-register" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium">
                Admin Registration
              </Link>
            </div>
            
            <div className="border-t border-red-200 dark:border-red-800 pt-4 space-y-1">
              <div>
                <span className="text-muted-foreground">Regular user? </span>
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  User Login
                </Link>
              </div>
              <div>
                <span className="text-muted-foreground">Teacher? </span>
                <Link to="/auth/teacher-login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Teacher Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}