import { Resend } from 'resend';
import { config } from '../config/env.js';

const resend = new Resend(config.resendApiKey);

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${config.clientUrl}/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: config.resendFromEmail || 'onboarding@resend.dev',
      to,
      subject: 'PDF Rag | Verify your email address',
      html: `
        <h2>Welcome to PDF RAG!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    console.log('Verification email sent successfully:', data);
  } catch (err: any) {
    console.error('Failed to send verification email:', err);
    throw err;
  }
}
