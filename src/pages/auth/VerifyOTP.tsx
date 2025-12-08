import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVerifyOtpMutation, useSendOtpMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  if (!email) {
    navigate("/auth/register");
    return null;
  }

  const verifyOTPHandler = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyOtp({
        email,
        otp,
      }).unwrap();

      toast({
        title: "Success!",
        description: "Your account has been verified. Please login.",
      });

      navigate("/auth/login");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Invalid OTP",
        description: error?.data?.message || "The OTP you entered is incorrect or has expired",
        variant: "destructive",
      });
    }
  };

  const resendOTP = async () => {
    try {
      await sendOtp({ email }).unwrap();

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email address",
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Verify OTP</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email address
          </p>
          <p className="text-sm font-medium mt-1">{email}</p>
        </div>

        <div className="bg-card border rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={verifyOTPHandler}
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center">
              <button
                onClick={resendOTP}
                disabled={isResending}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
