// Extracts raw text from an uploaded resume file so it can be cleaned by
// prepareResumeText() (prompt.js) and sent to the AI provider. One extractor per MIME type
// in config.js's ALLOWED_RESUME_TYPES; the routes layer never reads file formats itself.
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';

async function extractPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const { text } = await parser.getText();
    return text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

async function extractDoc(buffer) {
  const doc = await new WordExtractor().extract(buffer);
  return doc.getBody();
}

const EXTRACTORS = {
  'application/pdf': extractPdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extractDocx,
  'application/msword': extractDoc,
};

// Returns the extracted text, or '' if the file has none (e.g. a scanned, image-only PDF)
// or the text couldn't be read at all. Callers decide what to do with little or no text
// (prepareResumeText().isEmpty); this function never throws for a file it can open but
// can't get text from.
export async function extractResumeText(filePath, mimeType) {
  const extractor = EXTRACTORS[mimeType];
  if (!extractor) throw new Error(`Unsupported resume file type: ${mimeType}`);
  const buffer = await readFile(filePath);
  try {
    return (await extractor(buffer)) ?? '';
  } catch {
    return '';
  }
}
