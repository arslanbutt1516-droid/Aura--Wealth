/**
 * Email Service
 * Abstraction layer for email delivery.
 * Configure SMTP credentials in .env.local to activate.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  configured: boolean;
}

class EmailService {
  private configured: boolean;

  constructor() {
    this.configured = !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    );
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    if (!this.configured) {
      console.warn(
        "[EmailService] Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env.local"
      );
      return {
        success: false,
        error:
          "Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env.local",
        configured: false,
      };
    }

    try {
      // Dynamic import to avoid issues when nodemailer isn't available
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Aura Wealth Terminal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      return {
        success: true,
        messageId: info.messageId,
        configured: true,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("[EmailService] Send failed:", msg);
      return { success: false, error: msg, configured: true };
    }
  }

  async sendWelcomeEmail(name: string, email: string): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: "Welcome to Aura Wealth Terminal! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080920; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #06b6d4; font-size: 28px; margin-bottom: 8px;">Welcome to Aura Wealth Terminal!</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Your Smart Prize Bond & Currency Assistant for Pakistan</p>
          <p style="color: #e2e8f0; font-size: 16px;">Hi ${name},</p>
          <p style="color: #e2e8f0;">Your account has been created successfully. You can now:</p>
          <ul style="color: #94a3b8; line-height: 1.8;">
            <li>Track your Prize Bond portfolio</li>
            <li>Check prize bond results instantly</li>
            <li>Use AI to scan bond numbers from images</li>
            <li>Monitor live currency exchange rates</li>
            <li>Get AI-powered financial assistance</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; margin-top: 24px; padding: 12px 32px; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Go to Dashboard
          </a>
          <p style="color: #475569; font-size: 12px; margin-top: 40px;">
            Aura Wealth Terminal is an informational financial utility. Prize bond results and currency rates should be verified with authoritative sources.
          </p>
        </div>
      `,
    });
  }

  async sendPrizeBondWinAlert(
    email: string,
    name: string,
    bondNumber: string,
    denomination: number,
    prizeAmount: number,
    drawNumber: string
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `🎉 Congratulations! Your Prize Bond ${bondNumber} has WON!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080920; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #22c55e; font-size: 28px;">🎉 You Won!</h1>
          <p style="color: #e2e8f0;">Dear ${name},</p>
          <p style="color: #e2e8f0;">Your Prize Bond <strong style="color: #06b6d4;">${bondNumber}</strong> (Rs. ${denomination.toLocaleString()}) has won a prize in Draw #${drawNumber}!</p>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="color: #94a3b8; margin: 0 0 8px;">Prize Amount</p>
            <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 0;">Rs. ${prizeAmount.toLocaleString()}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Please verify this result with the official State Bank of Pakistan website before claiming your prize.</p>
        </div>
      `,
    });
  }

  async sendCurrencyAlert(
    email: string,
    name: string,
    base: string,
    target: string,
    currentRate: number,
    targetRate: number,
    direction: string
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `💱 Currency Alert: ${base}/${target} rate ${direction} ${targetRate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080920; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #06b6d4;">Currency Alert Triggered</h1>
          <p style="color: #e2e8f0;">Dear ${name},</p>
          <p style="color: #e2e8f0;">Your currency alert for <strong>${base}/${target}</strong> has been triggered.</p>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="color: #94a3b8;">Current Rate: <strong style="color: #06b6d4;">${currentRate}</strong></p>
            <p style="color: #94a3b8;">Your Target: <strong style="color: #f59e0b;">${direction} ${targetRate}</strong></p>
          </div>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
