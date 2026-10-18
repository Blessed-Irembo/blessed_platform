import * as nodemailer from 'nodemailer';

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  const user = process.env.GMAIL_USER || 'blessedirembo@gmail.com';
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (!pass) {
    throw new Error('GMAIL_APP_PASSWORD environment variable is missing.');
  }

  transporterInstance = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return transporterInstance;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const { to, subject, html, text } = params;
  const user = process.env.GMAIL_USER || 'blessedirembo@gmail.com';

  const transporter = getTransporter();

  const mailOptions = {
    from: `"Blessed Irembo" <${user}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
  return true;
}
