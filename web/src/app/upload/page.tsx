"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, uploadEncryptedFile } from "@/lib/lighthouse";
import { Loader2, UploadCloud } from "lucide-react";
import { parseFilename, sendMetadataToApi } from "@/lib/utils/upload";
import { FileSelector } from "@/components/FileSelector";
import { UploadStatus } from "@/components/UploadStatus";

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

    const { filename, extension } = parseFilename(file);

    try {
      setError("");
      setLoading(true);

      // Lighthouse Upload Process
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

      // Send Metadata to Next.js API
      const apiResponse = await sendMetadataToApi({
        filename,
        fileExtension: extension,
        userAddress,
        cid: newCid,
      });

      if (apiResponse.receiptStatus === "success") {
        setStatus("Metadata stored successfully!");
        console.log("Transaction Hash:", apiResponse.txHash);
      } else {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-900/30 via-blue-900/10 to-transparent rounded-full blur-3xl" />

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
              <FileSelector file={file} onFileSelect={handleFileSelect} />

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

              <UploadStatus
                loading={loading}
                status={status}
                progress={progress}
                error={error}
                cid={cid}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
