import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mobile } = await req.json();

    if (!mobile) {
      throw new Error('Mobile number is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with 10-minute expiration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert({
        mobile,
        otp,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      throw dbError;
    }

    // Send OTP via WhatsApp (using WhatsApp Business API)
    // For now, we'll log it (in production, integrate with WhatsApp Business API)
    console.log(`OTP for ${mobile}: ${otp}`);
    
    // TODO: Implement actual WhatsApp API integration
    // Example using WhatsApp Business API:
    // const whatsappResponse = await fetch('https://api.whatsapp.com/send', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${WHATSAPP_API_KEY}` },
    //   body: JSON.stringify({
    //     to: mobile,
    //     message: `Your verification code is: ${otp}. Valid for 10 minutes.`
    //   })
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // For development only - remove in production
        otp: Deno.env.get('DENO_ENV') === 'development' ? otp : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});