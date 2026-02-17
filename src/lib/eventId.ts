/**
 * Centralised event ID generator for Meta Pixel and CAPI deduplication.
 * Use the same ID when sending an event to both Pixel (client) and CAPI (server).
 */

/**
 * Generates a unique event ID suitable for Meta deduplication.
 * Safe to use in both browser and Node (crypto.randomUUID()).
 * @param prefix - Optional prefix for readability in logs (e.g. "Purchase", "Contact")
 */
export function generateEventId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}-${id}` : id;
}
