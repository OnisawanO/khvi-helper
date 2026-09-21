export type InterpreterCertificateUpload = {
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export async function uploadInterpreterCertificate(file: File): Promise<InterpreterCertificateUpload> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/interpreter-certificates/upload", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as Partial<InterpreterCertificateUpload> & {
    error?: string;
  };

  if (!response.ok || !result.path || !result.fileName || !result.mimeType || result.size === undefined) {
    throw new Error(result.error ?? "ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่");
  }

  return {
    path: result.path,
    fileName: result.fileName,
    mimeType: result.mimeType,
    size: result.size,
  };
}
