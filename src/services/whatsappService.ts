/**
 * WhatsApp Service Adapter
 * Ready for WhatsApp Business API integration.
 * Configure WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID in .env.local
 */

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  configured: boolean;
}

class WhatsAppService {
  private configured: boolean;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.configured = !!(
      process.env.WHATSAPP_API_KEY &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.accessToken = process.env.WHATSAPP_API_KEY || "";
  }

  /**
   * Send a plain text WhatsApp message via Meta Business API
   */
  async sendMessage(to: string, body: string): Promise<WhatsAppResult> {
    if (!this.configured) {
      console.warn(
        "[WhatsAppService] Not configured. Set WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID in .env.local"
      );
      return {
        success: false,
        error: "WhatsApp service not configured.",
        configured: false,
      };
    }

    try {
      // CQ-07 FIX: Updated from deprecated v18.0. Configurable via WHATSAPP_API_VERSION env var.
      const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
      const url = `https://graph.facebook.com/${apiVersion}/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""), // strip non-digits
        type: "text",
        text: { body },
      };

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (resp.ok && data.messages?.[0]?.id) {
        return {
          success: true,
          messageId: data.messages[0].id,
          configured: true,
        };
      }

      return {
        success: false,
        error: data.error?.message || "WhatsApp API error",
        configured: true,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: msg, configured: true };
    }
  }

  async sendPrizeBondAlert(
    to: string,
    name: string,
    bondNumber: string,
    denomination: number,
    prizeAmount: number
  ): Promise<WhatsAppResult> {
    const body =
      `🎉 *Aura Wealth Terminal — Prize Bond Alert*\n\n` +
      `Dear ${name},\n\n` +
      `Your Prize Bond *${bondNumber}* (Rs. ${denomination.toLocaleString()}) has *WON*!\n\n` +
      `💰 Prize Amount: *Rs. ${prizeAmount.toLocaleString()}*\n\n` +
      `⚠️ Please verify with the official SBP website before claiming your prize.\n\n` +
      `_Aura Wealth Terminal — Your Smart Prize Bond & Currency Assistant_`;

    return this.sendMessage(to, body);
  }

  async sendCurrencyAlert(
    to: string,
    name: string,
    base: string,
    target: string,
    rate: number,
    targetRate: number,
    direction: string
  ): Promise<WhatsAppResult> {
    const body =
      `💱 *Aura Wealth Terminal — Currency Alert*\n\n` +
      `Dear ${name},\n\n` +
      `${base}/${target} is now *${rate}*\n` +
      `Your target was: ${direction} *${targetRate}*\n\n` +
      `_Aura Wealth Terminal — Your Smart Prize Bond & Currency Assistant_`;

    return this.sendMessage(to, body);
  }

  async sendDrawReminder(
    to: string,
    name: string,
    denomination: number,
    drawNumber: string,
    drawDate: string
  ): Promise<WhatsAppResult> {
    const body =
      `📅 *Aura Wealth Terminal — Draw Reminder*\n\n` +
      `Dear ${name},\n\n` +
      `Upcoming Prize Bond Draw:\n` +
      `Denomination: *Rs. ${denomination.toLocaleString()}*\n` +
      `Draw Number: *${drawNumber}*\n` +
      `Draw Date: *${drawDate}*\n\n` +
      `_Aura Wealth Terminal — Your Smart Prize Bond & Currency Assistant_`;

    return this.sendMessage(to, body);
  }
}

export const whatsAppService = new WhatsAppService();
