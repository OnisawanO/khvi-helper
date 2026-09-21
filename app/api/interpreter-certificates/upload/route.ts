import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("The upload payload could not be read.", 400);
  }

  const fileValue = formData.get("file");
  if (
    !fileValue ||
    typeof fileValue === "string" ||
    typeof fileValue.arrayBuffer !== "function"
  ) {
    return errorResponse("Choose a certificate file before uploading.", 400);
  }

  const file = fileValue as File;
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return errorResponse(
      "Certificate files must be between 1 byte and 10 MB.",
      413,
    );
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return errorResponse(
      "Only PDF, JPG, and PNG certificate files are supported.",
      415,
    );
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return errorResponse("Your session has expired. Please sign in again.", 401);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-") || "certificate";
  const path = `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("interpreter-certificates")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return errorResponse("The certificate upload failed. Please try again.", 500);
  }

  return NextResponse.json({
    path,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
}
