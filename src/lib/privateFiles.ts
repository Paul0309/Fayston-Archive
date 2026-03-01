import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function transcriptStorageDir(userId: string) {
  return path.join(process.cwd(), "storage", "private", "transcripts", userId);
}

export async function saveTranscriptFile(params: {
  userId: string;
  documentId: string;
  fileName: string;
  bytes: Uint8Array;
}) {
  const safeName = sanitizeFileName(params.fileName);
  const storedName = `${params.documentId}-${safeName}`;
  const dir = transcriptStorageDir(params.userId);
  await mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, storedName);
  await writeFile(absolutePath, params.bytes);

  return {
    storedName,
    absolutePath,
    relativePath: path.join("transcripts", params.userId, storedName).replace(/\\/g, "/"),
  };
}

export function privateStoragePath(relativePath: string) {
  return path.join(process.cwd(), "storage", "private", relativePath);
}

export async function removePrivateFile(relativePath: string) {
  try {
    await unlink(privateStoragePath(relativePath));
  } catch {
    // Ignore missing file cleanup errors.
  }
}
