-- Create OTP verifications table
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  otp TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for OTP verifications
CREATE POLICY "Users can view their own OTP verifications"
ON public.otp_verifications
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert OTP verifications"
ON public.otp_verifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own OTP verifications"
ON public.otp_verifications
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_mobile ON public.otp_verifications(mobile);
CREATE INDEX idx_otp_expires_at ON public.otp_verifications(expires_at);