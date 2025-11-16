import fs from "fs";
import path from "path";
import { smsMetrics } from "./smsMetrics";

interface Shept {
  language: string;
  text: string;
}

interface SheptsInput {
  shepts: Shept[];
}

interface MessageTranslation {
  messageId: number;
  language: string;
  text: string;
  length: number;
  encoding: string;
  parts: number;
}

interface SheptsUploadOutput {
  messageTranslations: MessageTranslation[];
}

function normalizeEncoding(encoding: string): string {
  // Convert "UCS-2" to "UCS2" and "GSM-7" to "GSM7" to match output format
  return encoding.replace(/-/g, "");
}

function main() {
  // Read input file
  const inputPath = path.resolve(".shepts/shepts.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  let inputData: SheptsInput;
  try {
    const raw = fs.readFileSync(inputPath, "utf-8");
    inputData = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read or parse file: ${inputPath}`, err);
    process.exit(1);
  }

  if (!Array.isArray(inputData.shepts)) {
    console.error("Invalid input: 'shepts' must be an array");
    process.exit(1);
  }

  // Transform each shept entry
  const messageTranslations: MessageTranslation[] = inputData.shepts.map(
    (shept, index) => {
      const metrics = smsMetrics(shept.text);

      return {
        messageId: index + 1, // 1-indexed
        language: shept.language,
        text: shept.text,
        length: metrics.length,
        encoding: normalizeEncoding(metrics.encoding),
        parts: metrics.parts,
      };
    }
  );

  // Create output object
  const output: SheptsUploadOutput = {
    messageTranslations,
  };

  // Write output file
  const outputPath = path.resolve(".shepts/shepts_upload.json");
  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(output, null, 2) + "\n",
      "utf-8"
    );
    console.log(
      `✅ Successfully transformed ${messageTranslations.length} shept(s) to ${outputPath}`
    );
  } catch (err) {
    console.error(`Failed to write output file: ${outputPath}`, err);
    process.exit(1);
  }
}

main();
