"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, uploadEncryptedFile } from "@/lib/lighthouse";
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  XCircle,
  FileIcon,
} from "lucide-react";

// Function to send metadata to Next.js API
const sendMetadataToApi = async (data: {
  filename: string;
  fileExtension: string;
  userAddress: string;
  cid: string; // Including CID as well, which is crucial metadata
}) => {
  const response = await fetch("/api/store-metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json(); // Read the error body from the API
    // The API sends { message: "Failed to register...", error: "..." }
    throw new Error(
      errorBody.error || "Failed to store metadata on the server.",
    );
  }
  return response.json();
};

export default function UploadPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setCid("");
    setStatus("");
    setError("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet before uploading.");
      return;
    }
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    // Extract filename and extension
    const fullFilename = file.name;
    const parts = fullFilename.split(".");
    let filename = parts.slice(0, -1).join(".");
    if (parts.length == 1) {
      filename = fullFilename;
    }
    const fileExtension = parts.length > 1 ? (parts.pop() as string) : "";

    try {
      setError("");
      setLoading(true);

      // --- 1. Lighthouse Upload Process ---
      setStatus("Signing message...");
      setProgress(10);
      const signedMsg = await getSignedMessage(userAddress, walletClient);

      setStatus("Uploading encrypted file...");
      const newCid = await uploadEncryptedFile(
        [file],
        userAddress,
        signedMsg,
        (progress) => {
          const percent = Math.round(
            (progress.uploaded / progress.total) * 100,
          );
          setProgress(percent);
          setStatus(`Uploading... ${percent}%`);
        },
      );

      setCid(newCid);
      setStatus("Upload complete! Storing metadata...");
      setProgress(95);

      // --- 2. Send Metadata to Next.js API ---
      const apiResponse = await sendMetadataToApi({
        filename,
        fileExtension,
        userAddress,
        cid: newCid,
      });

      if (apiResponse.receiptStatus === "success") {
        setStatus("Metadata stored successfully!");
        console.log("Transaction Hash:", apiResponse.txHash);
      } else {
        // This case should ideally be caught by the response.ok check in sendMetadataToApi,
        // but included for robustness.
        throw new Error(
          "Transaction failed or was reverted on the blockchain.",
        );
      }

      setProgress(100);
    } catch (err: any) {
      console.error("Upload/Metadata Error:", err);
      setError(err.message || "An upload or metadata storage error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-purple-900/30 via-blue-900/10 to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-950/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <UploadCloud className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Secure Upload</h2>
        </div>

        <div className="space-y-6">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Please connect your wallet to continue.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <label
                htmlFor="file"
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-white/5 transition-colors duration-300"
              >
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <FileIcon className="w-8 h-8 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-gray-400">
                    <UploadCloud className="w-8 h-8 text-gray-500" />
                    <span className="text-sm font-medium">
                      Click to choose a file
                    </span>
                    <span className="text-xs">(max 100MB recommended)</span>
                  </div>
                )}
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {status.includes("Uploading")
                      ? "Encrypting & Uploading..."
                      : status}
                  </>
                ) : (
                  "Encrypt & Upload"
                )}
              </button>

              {loading && (
                <div className="w-full">
                  <p className="text-sm text-gray-400 text-center mb-2">
                    {status}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {cid && !loading && !error && (
                <div className="text-center space-y-2 pt-2">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      Upload & Metadata successful!
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 break-all px-4">
                    CID: {cid}
                  </p>
                  <a
                    href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-xs font-semibold"
                  >
                    View on IPFS Gateway
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
