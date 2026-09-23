import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || typeof path !== "string") {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check authorization: must be owner of the folder or staff (Manager/Admin)
  const isOwner = path.startsWith(`${user.id}/`);
  let isAuthorized = isOwner;

  if (!isAuthorized) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.role === "Manager" || profile?.role === "Admin") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Attempt to download the file directly from private storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("interpreter-certificates")
    .download(path);

  if (downloadError || !fileData) {
    // If direct download fails, try signed URL redirect
    const { data: signed } = await supabase.storage
      .from("interpreter-certificates")
      .createSignedUrl(path, 3600);

    if (signed?.signedUrl) {
      return NextResponse.redirect(signed.signedUrl);
    }

    return new NextResponse("Document not found", { status: 404 });
  }

  const fileName = path.split("/").pop() || "certificate";
  const ext = fileName.split(".").pop()?.toLowerCase();
  let contentType = fileData.type || "application/octet-stream";

  if (ext === "pdf") {
    contentType = "application/pdf";
  } else if (ext === "jpg" || ext === "jpeg") {
    contentType = "image/jpeg";
  } else if (ext === "png") {
    contentType = "image/png";
  } else if (ext === "webp") {
    contentType = "image/webp";
  }

  return new Response(fileData, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

