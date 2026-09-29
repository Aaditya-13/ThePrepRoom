import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface TotpSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  recoveryCodes: string[];
  hashedRecoveryCodes: string;
}

/**
 * Generates a new TOTP secret, QR code data URL, and 8 secure recovery backup codes
 */
export async function generateTotpSetup(adminEmail: string): Promise<TotpSetupResult> {
  const secret = generateSecret();
  const issuer = "ThePrepRoom Admin Portal";
  const otpauthUrl = generateURI({
    issuer,
    label: adminEmail,
    secret,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  // Generate 8 backup recovery codes (format: XXXX-XXXX)
  const recoveryCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    recoveryCodes.push(formatted);
  }

  // Hash each recovery code before storing in the database
  const hashedArray = recoveryCodes.map((code) => bcrypt.hashSync(code.trim().toUpperCase(), 10));
  const hashedRecoveryCodes = JSON.stringify(hashedArray);

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
    recoveryCodes,
    hashedRecoveryCodes,
  };
}

/**
 * Validates a 6-digit TOTP token against the user's secret
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    const cleanToken = token.replace(/\s+/g, "").trim();
    if (!/^\d{6}$/.test(cleanToken)) return false;
    const result = verifySync({
      token: cleanToken,
      secret,
    });
    return !!result?.valid;
  } catch {
    return false;
  }
}

/**
 * Verifies a single-use backup recovery code.
 * If valid, consumes that code and returns updated JSON of remaining codes.
 */
export function verifyAndConsumeRecoveryCode(
  inputCode: string,
  hashedCodesJson: string | null
): { valid: boolean; updatedHashedCodesJson: string | null } {
  if (!hashedCodesJson) {
    return { valid: false, updatedHashedCodesJson: null };
  }

  try {
    const hashedList: string[] = JSON.parse(hashedCodesJson);
    const normalizedInput = inputCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    let matchedIndex = -1;

    for (let i = 0; i < hashedList.length; i++) {
      // Recovery codes are formatted as XXXX-XXXX or XXXXXXXX
      const candidateFormatted = `${normalizedInput.slice(0, 4)}-${normalizedInput.slice(4, 8)}`;
      if (
        bcrypt.compareSync(candidateFormatted, hashedList[i]) ||
        bcrypt.compareSync(normalizedInput, hashedList[i])
      ) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      return { valid: false, updatedHashedCodesJson: hashedCodesJson };
    }

    // Remove consumed code from remaining list
    const remaining = [...hashedList];
    remaining.splice(matchedIndex, 1);

    return {
      valid: true,
      updatedHashedCodesJson: JSON.stringify(remaining),
    };
  } catch {
    return { valid: false, updatedHashedCodesJson: hashedCodesJson };
  }
}
