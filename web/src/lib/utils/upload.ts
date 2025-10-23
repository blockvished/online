// lib/utils/upload.ts

/**
 * Extracts filename and extension from a File object
 */
export const parseFilename = (
  file: File,
): { filename: string; extension: string } => {
  const fullFilename = file.name;
  const parts = fullFilename.split(".");

  let filename = parts.slice(0, -1).join(".");
  if (parts.length === 1) {
    filename = fullFilename;
  }

  const extension = parts.length > 1 ? (parts.pop() as string) : "";

  return { filename, extension };
};

/**
 * Sends metadata to the API endpoint
 */
export const sendMetadataToApi = async (data: {
  filename: string;
  fileExtension: string;
  userAddress: string;
  cid: string;
}) => {
  const response = await fetch("/api/store-metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.error || "Failed to store metadata on the server.",
    );
  }

  return response.json();
};

/**
 * Format file size in MB
 */
export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2);
};
