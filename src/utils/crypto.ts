/**
 * Hashes a plaintext password string using SHA-256 via browser Web Crypto APIs.
 * Returns a hexadecimal representation of the hash.
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('SHA-256 Web Crypto hashing failed, falling back to plainText:', err);
    return plainText;
  }
}
