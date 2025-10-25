// components/ZkTLS_Uploader.tsx

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion"; // Added for animations
import { useAccount, useWalletClient } from "wagmi";
import {
  getSignedMessage,
  uploadEncryptedFileWithZkTLS,
  createZkTLSConditions,
} from "@/lib/lighthouse-zktls";
// Removed unused shadcn components (Button, Card, Progress) and replaced with custom styles/elements
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  XCircle,
  FileIcon,
  Shield,
  Github, // Added for better icons
  Mail, // Added for better icons
  ExternalLink,
} from "lucide-react";

type AccessControlType = "none" | "github" | "google";

export default function ZkTLS_Uploader() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [accessControlType, setAccessControlType] =
    useState<AccessControlType>("none");
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [googleEmail, setGoogleEmail] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setCid("");
    setStatus("");
    setError("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress(0);
    setStatus("Waiting for signature...");

    try {
      const signedMsg = await getSignedMessage(userAddress, walletClient);
      setStatus("Signature received!");

      let accessConditions: any[] = [];
      if (accessControlType === "github" && githubUsername) {
        setStatus("Creating zkTLS conditions for GitHub...");
        accessConditions = createZkTLSConditions("github", {
          requiredUsername: githubUsername,
        });
      } else if (accessControlType === "google" && googleEmail) {
        setStatus("Creating zkTLS conditions for Google...");
        accessConditions = createZkTLSConditions("google", {
          requiredEmail: googleEmail,
        });
      }

      setStatus("Encrypting and uploading file...");
      const { cid: uploadedCid, accessControl } =
        await uploadEncryptedFileWithZkTLS(
          [file],
          userAddress,
          signedMsg,
          accessConditions,
          (progress) => {
            const percent = Math.round(
              (progress.uploaded / progress.total) * 100,
            );
            setProgress(percent);
            setStatus(`Uploading... ${percent}%`);
          },
        );

      setCid(uploadedCid);
      setProgress(100);

      if (accessControl) {
        setStatus("✅ Upload complete with zkTLS protection!");
      } else {
        setStatus("✅ Upload complete! (Encrypted, owner only)");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected upload error occurred.");
      setStatus("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderAccessControlInput = (type: AccessControlType) => {
    if (type === "github") {
      return (
        <div className="relative">
          <Github className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Required GitHub Username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            disabled={loading}
          />
        </div>
      );
    }
    if (type === "google") {
      return (
        <div className="relative">
          <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="Required Google Email"
            value={googleEmail}
            onChange={(e) => setGoogleEmail(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            disabled={loading}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative flex-grow flex items-center justify-center p-4 min-h-[80vh]">
      {/* Background Glow - Matching Decrypt Page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-900/30 via-purple-900/10 to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl shadow-2xl shadow-purple-900/50 p-8"
      >
        {/* Header - Matching Decrypt Page */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-cyan-600/30">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            zkTLS Secure Uploader
          </h2>
          <p className="text-gray-400 text-center text-sm">
            Encrypt and upload files with optional social identity access
            control.
          </p>
        </div>

        <div className="space-y-6">
          {!isConnected ? (
            <p className="text-center text-sm text-yellow-400 py-8 border border-yellow-400/30 bg-yellow-900/10 rounded-xl">
              <span className="font-semibold">Wallet Required:</span> Please
              connect your wallet to proceed with the upload.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-5">
              {/* Access Control Selection */}
              <div className="space-y-3 w-full">
                <label className="block text-sm font-semibold text-gray-300">
                  zkTLS Access Control (Optional)
                </label>
                <select
                  value={accessControlType}
                  onChange={(e) =>
                    setAccessControlType(e.target.value as AccessControlType)
                  }
                  className="w-full bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  disabled={loading}
                >
                  <option value="none" className="bg-gray-800">
                    Owner Only (No Restriction)
                  </option>
                  <option value="github" className="bg-gray-800">
                    Require GitHub Account
                  </option>
                  <option value="google" className="bg-gray-800">
                    Require Google Account
                  </option>
                </select>

                {/* Conditional Input */}
                {renderAccessControlInput(accessControlType)}
              </div>

              {/* File Upload Area */}
              <label
                htmlFor="file-upload"
                className={`w-full flex flex-col items-center justify-center border-2 ${
                  file
                    ? "border-green-500/50 bg-green-900/10"
                    : "border-dashed border-gray-600 hover:border-cyan-500"
                } rounded-xl p-8 cursor-pointer transition-all`}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                {file ? (
                  <div className="text-center text-green-400">
                    <FileIcon className="w-8 h-8 mx-auto" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-green-500 block">
                      Ready to Upload
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <UploadCloud className="w-8 h-8 mx-auto" />
                    <span className="text-sm font-medium">
                      Click or drag to choose a file
                    </span>
                  </div>
                )}
              </label>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    {status.split("...").pop() || "Processing..."}
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Encrypt & Upload
                  </>
                )}
              </button>

              {/* Progress Bar & Status */}
              {loading && (
                <div className="w-full space-y-2">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-center p-2 border border-gray-700 rounded-lg bg-gray-800/50">
                    <p className="text-sm text-cyan-400">{status}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-center p-3 gap-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-sm"
                >
                  <XCircle className="w-5 h-5 flex-shrink-0" />{" "}
                  <span className="break-words">{error}</span>
                </motion.div>
              )}

              {/* Success Output */}
              {cid && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center space-y-4 pt-4 border-t border-gray-700/50"
                >
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                    <CheckCircle className="w-5 h-5" /> {status}
                  </div>

                  <p className="text-sm text-gray-300 font-medium break-all">
                    CID:{" "}
                    <span className="text-white font-mono text-xs">{cid}</span>
                  </p>

                  <a
                    href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-cyan-600/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on IPFS Gateway
                  </a>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
