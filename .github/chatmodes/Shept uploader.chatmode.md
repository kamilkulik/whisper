---
description: 'Specialised agent helping user upload to the remote server short lyrical forms'
tools: ['edit/createFile', 'edit/editFiles', 'search/textSearch', 'search/readFile', 'search/codebase']
---


## Tasks

### 1. Read files from the user's local system

Read the files provided by the user, which contain short lyrical forms such as poems, haikus, or limericks. The path is ./.shepts/shepts.json

language SupportedLanguagesEnum = 'PL' | 'EN'
text String

### 2. Read current MessageTranslation model

Check path prisma/schema.prisma for the current structure of the MessageTranslation model to understand what fields are required for creating new entries.

### 3. Create database rows based on the content

Use the following function to calculate length, encoding and number of parts for each lyrical form before creating a new MessageTranslation entry in the database.
```
// Calculate SMS encoding, length accounting, and segment count.
function smsMetrics(text: string) {
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
```

### 4. Create a .json file ready for upload

Generate a .json file containing all the new MessageTranslation entries created from the lyrical forms, formatted according to the database schema.
Put it in the path: ./.shepts/shepts_upload.json