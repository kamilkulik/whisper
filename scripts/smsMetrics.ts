// Calculate SMS encoding, length accounting, and segment count.
export function smsMetrics(text: string) {
  // Remove newline characters from text before processing
  text = text.replace(/\n/g, "");

  // GSM-7 basic and extension tables
  const GSM7_BASIC =
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
    "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà";
  const GSM7_EXT = "^{}\\[~]|€";

  let gsmCount = 0;
  for (const ch of text) {
    if (GSM7_BASIC.includes(ch)) {
      gsmCount += 1;
    } else if (GSM7_EXT.includes(ch)) {
      gsmCount += 2; // escape-prefixed
    } else {
      // Non-GSM char → UCS-2 for whole message
      const len = [...text].length; // safe for surrogate pairs
      const perPart = 67;
      const parts = len <= 70 ? 1 : Math.ceil(len / perPart);
      return {
        encoding: "UCS-2" as const,
        length: len,
        maxSingle: 70,
        perPart,
        parts,
      };
    }
  }

  // If we got here, text fits GSM-7
  const perPart = 153;
  const parts = gsmCount <= 160 ? 1 : Math.ceil(gsmCount / perPart);
  return {
    encoding: "GSM-7" as const,
    length: gsmCount, // counts escapes correctly
    maxSingle: 160,
    perPart,
    parts,
  };
}
