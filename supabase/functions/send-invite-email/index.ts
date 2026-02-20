// Supabase Edge Function: send-invite-email
// Sends a team invite email via Resend when a new invite is created.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Set this in Supabase secrets, e.g. "https://your-app.vercel.app"
const APP_URL = Deno.env.get('APP_URL') || 'https://homefarm.vercel.app';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        const { inviteId } = await req.json();

        if (!inviteId) {
            throw new Error('inviteId is required');
        }

        // Use service role to read invite details (bypasses RLS)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch invite with farm and inviter details
        const { data: invite, error: inviteError } = await supabase
            .from('invites')
            .select(`
        id,
        email,
        role,
        status,
        farm:farms (
          id,
          name
        ),
        inviter:users!invited_by (
          full_name,
          email
        )
      `)
            .eq('id', inviteId)
            .single();

        if (inviteError || !invite) {
            throw new Error(`Invite not found: ${inviteError?.message || 'unknown error'}`);
        }

        const farmName = (invite.farm as any)?.name || 'a farm';
        const inviterName = (invite.inviter as any)?.full_name || (invite.inviter as any)?.email || 'A team member';
        const inviteeEmail = invite.email;
        const role = invite.role;

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'HomeFarm <onboarding@resend.dev>',
                to: [inviteeEmail],
                subject: `You've been invited to join ${farmName} on HomeFarm`,
                html: generateEmailHtml({
                    farmName,
                    inviterName,
                    role,
                    appUrl: APP_URL,
                }),
            }),
        });

        if (!emailResponse.ok) {
            const errorBody = await emailResponse.text();
            throw new Error(`Resend API error: ${emailResponse.status} - ${errorBody}`);
        }

        const emailResult = await emailResponse.json();

        return new Response(
            JSON.stringify({ success: true, emailId: emailResult.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error sending invite email:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});

function generateEmailHtml({
    farmName,
    inviterName,
    role,
    appUrl,
}: {
    farmName: string;
    inviterName: string;
    role: string;
    appUrl: string;
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Farm Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 32px 28px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">🌾</div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">HomeFarm</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 4px 0 0;">Farm Management Made Simple</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 700; margin: 0 0 16px; text-align: center;">You're Invited! 🎉</h2>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
                <strong style="color: #1a1a1a;">${inviterName}</strong> has invited you to join
              </p>
              <!-- Farm Card -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 16px; font-weight: 700; color: #15803d; margin-bottom: 6px;">${farmName}</div>
                <div style="display: inline-block; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${role}
                </div>
              </div>
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 40px; border-radius: 10px; letter-spacing: 0.3px;">
                  Join the Farm →
                </a>
              </div>
              <p style="color: #718096; font-size: 13px; line-height: 1.6; text-align: center; margin: 0;">
                Sign up with this email address and you'll be automatically added to the team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                This invitation was sent via HomeFarm. If you didn't expect this, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
