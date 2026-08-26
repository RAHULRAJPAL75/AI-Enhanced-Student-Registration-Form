import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Gmail email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env.");
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Sends the password reset code to the given email address.
 * Returns only delivery metadata. The reset code is never returned to the API.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({ to, code, expiresInMinutes = 10 }) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [to],
    subject: "Your Rahul Lab password reset code",
    text: `Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { messageId: data.id };
}
