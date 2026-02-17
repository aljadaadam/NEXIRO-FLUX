const crypto = require('crypto');

function getSecret() {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.includes('CHANGE-THIS') || secret === 'your-secret-key-change-in-production') {
    console.warn('⚠️ API key encryption using weak fallback secret. Set API_KEY_ENCRYPTION_SECRET in .env');
    return 'dev-fallback-' + require('os').hostname();
  }
  return secret;
}

function deriveKey(secret) {
  // 32 bytes key for AES-256
  return crypto.createHash('sha256').update(String(secret)).digest();
}

function encryptApiKey(plainText) {
  if (plainText == null) return null;
  const text = String(plainText);
  if (!text) return null;

  // Avoid double-encrypt
  if (text.startsWith('enc:v1:')) return text;

  const key = deriveKey(getSecret());
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const cipherText = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${cipherText.toString('base64')}`;
}

function decryptApiKey(storedValue) {
  if (storedValue == null) return null;
  const value = String(storedValue);
  if (!value) return null;

  // Legacy/plaintext
  if (!value.startsWith('enc:v1:')) return value;

  const parts = value.split(':');
  if (parts.length !== 5) return null;

  const iv = Buffer.from(parts[2], 'base64');
  const tag = Buffer.from(parts[3], 'base64');
  const data = Buffer.from(parts[4], 'base64');

  const key = deriveKey(getSecret());
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  try {
    const plain = Buffer.concat([decipher.update(data), decipher.final()]);
    return plain.toString('utf8');
  } catch {
    return null;
  }
}

function apiKeyLast4(key) {
  if (key == null) return null;
  const s = String(key);
  const digits = s.slice(-4);
  return digits || null;
}

function apiKeyMaskedLast4(key) {
  const last4 = apiKeyLast4(key);
  if (!last4) return null;
  return `••••${last4}`;
}

function apiKeyMaskedHyphenated(key) {
  if (key == null) return null;
  const s = String(key).trim();
  if (!s) return null;

  // If key is already hyphenated, preserve segment count.
  const parts = s.split('-').filter(Boolean);
  const segmentCount = parts.length > 1 ? parts.length : 8;
  return Array.from({ length: segmentCount }, () => 'XXX').join('-');
}

module.exports = {
  encryptApiKey,
  decryptApiKey,
  apiKeyLast4,
  apiKeyMaskedLast4,
  apiKeyMaskedHyphenated
};
