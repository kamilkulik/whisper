/**
 * Centralised event ID generator for Meta Pixel and CAPI deduplication.
 * Use the same ID when sending an event to both Pixel (client) and CAPI (server).
 */

/**
 * Browser & Node-safe UUID v4 generator.
 * Prefers crypto.randomUUID() when available (secure contexts, Node 19+),
 * falls back to crypto.getRandomValues() which works in all modern browsers.
 */
function uuid(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback: manual UUID v4 via getRandomValues (works in all browsers)
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates a unique event ID suitable for Meta deduplication.
 * Safe to use in both browser and Node.
 * @param prefix - Optional prefix for readability in logs (e.g. "Purchase", "Contact")
 */
export function generateEventId(prefix?: string): string {
  const id = uuid();
  return prefix ? `${prefix}-${id}` : id;
}
