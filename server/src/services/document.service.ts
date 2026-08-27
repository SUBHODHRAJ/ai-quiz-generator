import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(
  filePath: string,
  originalName: string
): Promise<string> {

  const extension = path.extname(originalName).toLowerCase();

  if (extension === ".txt" || extension === ".md") {
    return await fs.readFile(filePath, "utf-8");
  }

  if (extension === ".pdf") {
    const buffer = await fs.readFile(filePath);
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath
    });

    return result.value;
  }

  throw new Error(
    "Unsupported file type. Use PDF, DOCX, TXT or MD."
  );
}
