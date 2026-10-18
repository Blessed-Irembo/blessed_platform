import { ReminderStage } from './types';

interface EmailContent {
  subject: string;
  headline: string;
  subheadline: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  actionMessage: string;
}

function getStageContent(stage: ReminderStage, daysRemaining: number): EmailContent {
  switch (stage) {
    case '7_days':
      return {
        subject: 'Reminder: Your Blessed Irembo Subscription Expires in 7 Days',
        headline: 'Subscription Renewal Notice',
        subheadline: 'Your pharmacy subscription will expire in 7 days.',
        badgeText: 'Expires in 7 Days',
        badgeBg: '#fef3c7',
        badgeColor: '#92400e',
        actionMessage: 'To ensure your pharmacy remains visible on the map and easily discoverable by patients, please renew your subscription before the expiration date.',
      };
    case '3_days':
      return {
        subject: 'Urgent: Only 3 Days Left on Your Blessed Irembo Subscription',
        headline: 'Important: Subscription Expiring Soon',
        subheadline: 'Only 3 days remaining before your listing is paused.',
        badgeText: 'Expires in 3 Days',
        badgeBg: '#ffedd5',
        badgeColor: '#c2410c',
        actionMessage: 'Avoid interruptions in your listing. Once expired, patients in your area will not be able to find your pharmacy on the map until renewed.',
      };
    case '1_day':
      return {
        subject: 'Final Notice: Your Blessed Irembo Subscription Expires Tomorrow',
        headline: 'Final Renewal Notice',
        subheadline: 'Your subscription expires tomorrow.',
        badgeText: 'Expires Tomorrow',
        badgeBg: '#fee2e2',
        badgeColor: '#b91c1c',
        actionMessage: 'This is your final reminder. Please renew today to prevent your pharmacy from being hidden from search results and navigation.',
      };
    case 'expired':
    default:
      return {
        subject: 'Action Required: Your Blessed Irembo Subscription Has Expired',
        headline: 'Your Subscription Has Expired',
        subheadline: 'Your pharmacy listing has been paused on the public map.',
        badgeText: 'Subscription Expired',
        badgeBg: '#f3f4f6',
        badgeColor: '#4b5563',
        actionMessage: 'Your pharmacy is currently hidden from patients searching for medicines. Renew now to instantly reactivate your listing and map visibility.',
      };
  }
}

export function buildReminderEmail(params: {
  pharmacyName: string;
  stage: ReminderStage;
  daysRemaining: number;
  expiryDateFormatted: string;
  renewalUrl: string;
}): { subject: string; html: string; text: string } {
  const { pharmacyName, stage, daysRemaining, expiryDateFormatted, renewalUrl } = params;
  const content = getStageContent(stage, daysRemaining);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0d9488; padding: 28px 32px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Blessed Irembo</h1>
                    <p style="margin: 4px 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">Healthcare & Pharmacy Network Rwanda</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Pharmacy Portal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              
              <!-- Badge -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; background-color: ${content.badgeBg}; color: ${content.badgeColor}; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
                  ${content.badgeText}
                </span>
              </div>

              <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px; font-weight: 700;">
                ${content.headline}
              </h2>
              <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.5;">
                Hello <strong>${pharmacyName}</strong>, ${content.subheadline}
              </p>

              <!-- Expiry Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Pharmacy</span><br>
                    <strong style="font-size: 16px; color: #0f172a;">${pharmacyName}</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Current Expiration Date</span><br>
                    <strong style="font-size: 16px; color: #0d9488;">${expiryDateFormatted}</strong>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px; color: #334155; font-size: 14px; line-height: 1.6;">
                ${content.actionMessage}
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${renewalUrl}" target="_blank" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);">
                      Renew Subscription Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Renewal Pricing & Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      Subscription Plans
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                      <tr>
                        <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>1 Month:</strong></td>
                        <td align="right" style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #0d9488; font-weight: 700;">1,000 RWF</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>3 Months (Most Popular):</strong></td>
                        <td align="right" style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #0d9488; font-weight: 700;">3,000 RWF</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;"><strong>12 Months (Full Year):</strong></td>
                        <td align="right" style="padding: 6px 0; color: #0d9488; font-weight: 700;">10,000 RWF</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- How to Renew -->
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #0f172a;">How to complete your renewal:</p>
                <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #64748b; line-height: 1.6;">
                  <li>Log in to your pharmacy dashboard at <a href="${renewalUrl}" style="color: #0d9488;">blessedirembo.com/pharmacy/subscription</a></li>
                  <li>Select your plan and pay via Mobile Money.</li>
                  <li>Upload a screenshot of your MoMo receipt for instant admin verification.</li>
                </ol>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
                Need help or have questions? Reply directly to this email at <a href="mailto:blessedirembo@gmail.com" style="color: #0d9488; text-decoration: none;">blessedirembo@gmail.com</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Blessed Irembo. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
${content.subject}

Hello ${pharmacyName},

${content.subheadline}
${content.actionMessage}

Pharmacy: ${pharmacyName}
Current Expiration Date: ${expiryDateFormatted}

Renew your subscription here:
${renewalUrl}

Subscription Plans:
- 1 Month: 1,000 RWF
- 3 Months: 3,000 RWF
- 12 Months: 10,000 RWF

How to Renew:
1. Log in to your pharmacy dashboard at ${renewalUrl}
2. Select your desired plan.
3. Pay via Mobile Money and upload your payment receipt for admin approval.

If you have any questions, reply directly to this email at blessedirembo@gmail.com.

Blessed Irembo Team
  `.trim();

  return {
    subject: content.subject,
    html,
    text,
  };
}
