import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * AES-256-GCM envelope encryption for secrets we must store (WhatsApp
 * access tokens, BYO AI provider keys). Key material comes from
 * SECRET_ENCRYPTION_KEY (32+ char passphrase) — never store plaintext
 * tokens in the database.
 */
@Injectable()
export class SecretBoxService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const passphrase = config.getOrThrow<string>("SECRET_ENCRYPTION_KEY");
    this.key = scryptSync(passphrase, "whatsapp-automation-saas", 32);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
  }

  decrypt(payload: string): string {
    const buf = Buffer.from(payload, "base64");
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  }
}
