import { Injectable, Logger } from "@nestjs/common";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface SendResult {
  whatsappMessageId: string;
}

/**
 * Thin, real HTTP client over the Meta WhatsApp Cloud API. No mocking —
 * every call here hits graph.facebook.com. Requires an active phone number
 * ID and a valid (decrypted) access token per call, since both are
 * per-workspace (multi-tenant: every business brings its own WABA).
 */
@Injectable()
export class WhatsappCloudApiClient {
  private readonly logger = new Logger(WhatsappCloudApiClient.name);

  private async post(
    phoneNumberId: string,
    accessToken: string,
    body: Record<string, unknown>,
  ): Promise<SendResult> {
    const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
    });

    const json = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message: string; type: string; code: number };
    };

    if (!res.ok || json.error) {
      this.logger.error(
        `WhatsApp send failed (${res.status}): ${json.error?.message ?? "unknown error"}`,
      );
      throw new Error(
        `WhatsApp Cloud API error: ${json.error?.message ?? res.statusText}`,
      );
    }

    return { whatsappMessageId: json.messages![0].id };
  }

  sendText(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    text: string,
    previewUrl = false,
  ): Promise<SendResult> {
    return this.post(phoneNumberId, accessToken, {
      to,
      type: "text",
      text: { body: text, preview_url: previewUrl },
    });
  }

  sendMedia(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    kind: "image" | "video" | "audio" | "document",
    media: { link?: string; id?: string; caption?: string; filename?: string },
  ): Promise<SendResult> {
    return this.post(phoneNumberId, accessToken, {
      to,
      type: kind,
      [kind]: media,
    });
  }

  sendButtons(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[],
  ): Promise<SendResult> {
    return this.post(phoneNumberId, accessToken, {
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    });
  }

  sendList(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    bodyText: string,
    buttonText: string,
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[],
  ): Promise<SendResult> {
    return this.post(phoneNumberId, accessToken, {
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: { button: buttonText, sections },
      },
    });
  }

  sendTemplate(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string,
    languageCode: string,
    components?: Record<string, unknown>[],
  ): Promise<SendResult> {
    return this.post(phoneNumberId, accessToken, {
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components ? { components } : {}),
      },
    });
  }

  markRead(
    phoneNumberId: string,
    accessToken: string,
    whatsappMessageId: string,
  ): Promise<void> {
    return fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: whatsappMessageId,
      }),
    }).then(() => undefined);
  }
}
