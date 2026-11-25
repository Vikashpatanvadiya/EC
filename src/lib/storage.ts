import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { ALLOWED_MIME_TO_EXT } from "./storage.client";

/**
 * Customer artwork store.
 *
 * Two backends behind one interface:
 *
 *  - Supabase Storage, used whenever SUPABASE_URL and
 *    SUPABASE_SERVICE_ROLE_KEY are set. This is what production uses:
 *    Vercel's filesystem is ephemeral and read-only, so writing uploads
 *    to disk there would fail, and anything written would vanish on the
 *    next deploy.
 *  - The local filesystem, for development with no Supabase project.
 *
 * Either way the bucket/folder is private. Files are served only through
 * /api/uploads/[key], which checks the caller owns the order, holds the
 * cart, or is an admin.
 */

const ROOT = path.join(process.cwd(), "storage", "uploads");
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "designs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const usingSupabaseStorage = Boolean(supabaseUrl && supabaseServiceKey);

// The service-role key bypasses row-level security, so this client is
// only ever constructed on the server and never handed to the browser.
const supabase = usingSupabaseStorage
  ? createClient(supabaseUrl as string, supabaseServiceKey as string, {
      auth: { persistSession: false },
    })
  : null;

export { MAX_UPLOAD_BYTES } from "./storage.client";

export function extensionFor(mime: string): string | undefined {
  return ALLOWED_MIME_TO_EXT[mime];
}

/** Opaque, unguessable key — never derived from the customer's filename. */
function newKey(ext: string): string {
  return `${Date.now().toString(36)}-${randomBytes(16).toString("hex")}.${ext}`;
}

/** Rejects anything that isn't a key we generated, so a crafted value
 *  can't walk out of the uploads directory or bucket folder. */
function assertSafeKey(storageKey: string): void {
  if (!/^[a-z0-9]+-[a-f0-9]{32}\.[a-z]+$/.test(storageKey)) {
    throw new Error("BAD_KEY");
  }
}

export async function saveUpload(
  bytes: Buffer,
  mime: string,
): Promise<{ storageKey: string }> {
  const ext = extensionFor(mime);
  if (!ext) throw new Error("UNSUPPORTED_TYPE");

  const storageKey = newKey(ext);

  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, bytes, { contentType: mime, upsert: false });
    if (error) throw new Error(`UPLOAD_FAILED: ${error.message}`);
    return { storageKey };
  }

  await mkdir(ROOT, { recursive: true });
  await writeFile(path.join(ROOT, storageKey), bytes);
  return { storageKey };
}

export async function readUpload(storageKey: string): Promise<Buffer> {
  assertSafeKey(storageKey);

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(storageKey);
    if (error || !data) throw new Error("NOT_FOUND");
    return Buffer.from(await data.arrayBuffer());
  }

  return readFile(path.join(ROOT, storageKey));
}

export async function deleteUpload(storageKey: string): Promise<void> {
  if (!/^[a-z0-9]+-[a-f0-9]{32}\.[a-z]+$/.test(storageKey)) return;

  if (supabase) {
    await supabase.storage.from(BUCKET).remove([storageKey]);
    return;
  }

  await unlink(path.join(ROOT, storageKey)).catch(() => {});
}
