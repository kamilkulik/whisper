import fs from "fs";
import path from "path";
import {
  MessageEncodingEnum,
  MessageTranslation,
  PrismaClient,
  SupportedLanguagesEnum,
} from "@prisma/client";

const prisma = new PrismaClient();

interface RawMessageTranslation {
  messageId: number;
  language: string;
  text: string;
  length: number;
  encoding: string;
  parts: number;
}

function isValidEnum<T extends string>(
  value: string,
  enumObject: Record<string, T>
): value is T {
  return Object.values(enumObject).includes(value as T);
}

function validateItem(item: unknown): item is RawMessageTranslation {
  if (!item || typeof item !== "object") return false;

  const it = item as Record<string, unknown>;
  return (
    typeof it.messageId === "number" &&
    typeof it.language === "string" &&
    typeof it.text === "string" &&
    typeof it.length === "number" &&
    typeof it.encoding === "string" &&
    typeof it.parts === "number" &&
    it.messageId > 0 &&
    it.length > 0 &&
    it.parts > 0 &&
    it.text.length > 0
  );
}

function transformItem(
  item: RawMessageTranslation
): Omit<MessageTranslation, "id" | "createdAt" | "updatedAt"> | null {
  // Validate enum values
  if (!isValidEnum(item.language, SupportedLanguagesEnum)) {
    console.error(
      `Invalid language: ${item.language}. Must be one of: ${Object.values(SupportedLanguagesEnum).join(", ")}`
    );
    return null;
  }

  if (!isValidEnum(item.encoding, MessageEncodingEnum)) {
    console.error(
      `Invalid encoding: ${item.encoding}. Must be one of: ${Object.values(MessageEncodingEnum).join(", ")}`
    );
    return null;
  }

  return {
    messageId: item.messageId,
    language: item.language as SupportedLanguagesEnum,
    text: item.text,
    length: item.length,
    encoding: item.encoding as MessageEncodingEnum,
    parts: item.parts,
  };
}

async function main() {
  const filePath = path.resolve(".shepts/shepts_upload.json");

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let parsed: { messageTranslations?: unknown[] };
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read or parse file: ${filePath}`, err);
    process.exit(1);
  }

  const items = parsed.messageTranslations;
  if (!Array.isArray(items) || items.length === 0) {
    console.log("No items to import");
    return;
  }

  // Validate and transform data
  const validData: Omit<
    MessageTranslation,
    "id" | "createdAt" | "updatedAt"
  >[] = [];
  const invalidItems: unknown[] = [];

  for (const item of items) {
    if (validateItem(item)) {
      const transformed = transformItem(item);
      if (transformed) {
        validData.push(transformed);
      } else {
        invalidItems.push(item);
      }
    } else {
      invalidItems.push(item);
      console.warn("Invalid item skipped:", item);
    }
  }

  if (invalidItems.length > 0) {
    console.warn(
      `Skipped ${invalidItems.length} invalid item(s). Continuing with ${validData.length} valid items.`
    );
  }

  if (validData.length === 0) {
    console.error("No valid items to import");
    return;
  }

  // Try bulk insert first
  try {
    const res = await prisma.messageTranslation.createMany({
      data: validData,
      skipDuplicates: true, // Uses the unique constraint [messageId, language]
    });
    console.log(`✅ Successfully inserted ${res.count} new translation(s)`);
  } catch (err) {
    console.error(
      "Bulk insert failed, falling back to individual upserts:",
      err
    );
    console.error(
      "Error details:",
      err instanceof Error ? err.message : String(err)
    );

    // Fallback: upsert one-by-one to handle duplicates and get better error messages
    let successCount = 0;
    let errorCount = 0;

    for (const row of validData) {
      try {
        await prisma.messageTranslation.upsert({
          where: {
            // Use the composite unique constraint [messageId, language]
            messageId_language: {
              messageId: row.messageId,
              language: row.language,
            },
          },
          create: row,
          update: {
            // Update all fields if record already exists
            text: row.text,
            length: row.length,
            encoding: row.encoding,
            parts: row.parts,
          },
        });
        successCount++;
      } catch (e) {
        errorCount++;
        console.error(
          `Failed to upsert translation for messageId=${row.messageId}, language=${row.language}:`,
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    console.log(
      `✅ Upserted ${successCount} translation(s), ${errorCount} error(s)`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
