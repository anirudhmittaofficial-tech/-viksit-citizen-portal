import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter using Gmail
let transporter;

/**
 * Sends an email via Brevo REST API (works across all cloud platforms via port 443 HTTPS)
 * or falls back to Gmail SMTP.
 */
const sendViaBrevoApi = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Viksit Support',
        email: process.env.BREVO_SENDER_EMAIL || 'myistorage2024@gmail.com'
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Brevo API Error: ${JSON.stringify(errData)}`);
  }

  return await response.json();
};

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
};

/**
 * Sends a password reset email to the user.
 * @param {string} to - The recipient's email address
 * @param {string} resetUrl - The secure reset URL containing the raw token
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Smart Civic Platform</h2>
      <p style="font-size: 16px; color: #555;">You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
      <p style="font-size: 16px; color: #555;">Please click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Smart Civic Resolution Platform. All rights reserved.</p>
    </div>
  `;

  // 1. Try Brevo HTTPS API first if BREVO_API_KEY is configured (Port 443 - Never blocked on Render)
  if (process.env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoApi({
        to,
        subject: 'Password Reset Request - VIKSIT',
        html: emailHtml
      });
      console.log('Password reset sent via Brevo HTTP API successfully:', result);
      return result;
    } catch (apiError) {
      console.error('Brevo API sending failed, falling back to SMTP:', apiError.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP credentials are not configured in environment variables. Email will not be sent.');
    return;
  }

  try {
    const client = getTransporter();
    const info = await client.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject: 'Password Reset Request - VIKSIT',
      html: emailHtml,
    });

    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer error in sendPasswordResetEmail:', error);
    throw error;
  }
};

/**
 * Sends a welcome email to the newly registered citizen.
 * @param {string} to - The recipient's email address
 * @param {string} name - The user's name
 */
export const sendWelcomeEmail = async (to, name) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP credentials are not configured in environment variables. Email will not be sent.');
    return;
  }

  try {
    const client = getTransporter();
    const info = await client.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject: 'Welcome to Smart Civic Resolution Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0F4C81; text-align: center;">Welcome, ${name}!</h2>
          <p style="font-size: 16px; color: #555;">Thank you for joining the Smart Civic Resolution Platform.</p>
          <p style="font-size: 16px; color: #555;">You can now report civic issues such as road hazards, sanitation delays, and broken streetlights directly to municipal authorities.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/citizen/dashboard" style="background-color: #2E8B57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
          </div>
          <p style="font-size: 14px; color: #777;">Together, we can build a better community!</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Smart Civic Resolution Platform. All rights reserved.</p>
        </div>
      `,
    });

    console.log('Welcome email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer error in sendWelcomeEmail:', error);
    throw error;
  }
};
