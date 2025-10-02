import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile;
  const userId = location.state?.userId;
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!mobile || !userId) {
    navigate("/auth/register");
    return null;
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP from database
      const { data: otpData, error: otpError } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("mobile", mobile)
        .eq("otp", otp)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect or has expired",
          variant: "destructive",
        });
        return;
      }

      // Mark OTP as verified
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", otpData.id);

      // Update user profile to verified
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success!",
        description: "Your account has been verified. Please login.",
      });

      navigate("/auth/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ mobile }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your WhatsApp",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
            Enter the 6-digit code sent to your WhatsApp
          </p>
          <p className="text-sm font-medium mt-1">{mobile}</p>
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
              onClick={verifyOTP}
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
