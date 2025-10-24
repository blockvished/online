"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk"; // Ensure lighthouse is imported
import { getSignedMessage, decryptEncryptedFile } from "@/lib/lighthouse";
import {
  Loader2,
  CheckCircle,
  XCircle,
  KeyRound,
  ExternalLink,
  Download,
} from "lucide-react";

// Define the expected structure of file info from Lighthouse
interface LighthouseFileInfo {
  cid: string;
  fileName: string;
  fileSizeInBytes: string;
  mimeType: string;
  // Add other properties if needed
}

export default function DecryptPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [cid, setCid] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null); // NEW STATE for filename
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    if (!cid) {
      setError("Please enter a CID.");
      return;
    }
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet.");
      return;
    }
    try {
      setError("");
      setFileUrl(null);
      setFileName(null); // Reset filename
      setLoading(true);

      // --- Step 1: Get signature ---
      setStatus("Signing message with wallet...");
      const signedMsg = await getSignedMessage(userAddress, walletClient);

      // --- Step 2: Decrypt file and get temporary access URL ---
      setStatus("Decrypting the file...");
      const url = await decryptEncryptedFile(cid, userAddress, signedMsg);

      // --- Step 3: Fetch file metadata (including name) ---
      setStatus("Fetching file metadata...");
      let fetchedFileName = "decrypted_file";
      try {
        const infoResponse: { data: LighthouseFileInfo } =
          await lighthouse.getFileInfo(cid);
        fetchedFileName = infoResponse.data.fileName;
      } catch (infoError) {
        console.warn(
          "Could not fetch file info for name suggestion:",
          infoError,
        );
        // Continue even if name fetch fails, using the default name
      }

      setFileUrl(url);
      setFileName(fetchedFileName); // Set the fetched name
      setStatus("File decrypted successfully! Access link generated.");
    } catch (err: any) {
      console.error(err);
      // More user-friendly error messages
      let displayError =
        err.message ||
        "Decryption failed. Ensure the CID is correct and you have access permission.";
      if (err.message.includes("no access")) {
        displayError =
          "Decryption failed. You do not have access permission for this file.";
      }
      setError(displayError);
      setFileUrl(null);
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow flex items-center justify-center p-4 min-h-[80vh]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-900/30 via-purple-900/10 to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl shadow-2xl shadow-purple-900/50 p-8"
      >
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-purple-600/30">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Secure Decryption
          </h2>
          <p className="text-gray-400 text-center text-sm">
            Access files shared with your wallet via Lighthouse protocol.
          </p>
        </div>

        <div className="space-y-6">
          {!isConnected ? (
            <p className="text-center text-sm text-yellow-400 py-8 border border-yellow-400/30 bg-yellow-900/10 rounded-xl">
              <span className="font-semibold">Wallet Required:</span> Please
              connect your wallet to authorize decryption.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-5">
              <input
                type="text"
                placeholder="Enter file CID to decrypt (e.g., Qm...)"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                disabled={loading}
              />

              <button
                onClick={handleDecrypt}
                disabled={loading || !cid}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    {status.split("...").pop() || "Processing..."}
                  </>
                ) : (
                  "Initiate Decryption"
                )}
              </button>

              {loading && (
                <div className="w-full text-center p-3 border border-gray-700 rounded-lg bg-gray-800/50">
                  <p className="text-sm text-cyan-400">{status}</p>
                </div>
              )}

              {error && (
                <div className="w-full flex items-center p-3 gap-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />{" "}
                  <span className="break-words">{error}</span>
                </div>
              )}

              {fileUrl && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center space-y-4 pt-4 border-t border-gray-700/50"
                >
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                    <CheckCircle className="w-5 h-5" /> Decryption Successful!
                  </div>

                  {fileName && (
                    <p className="text-sm text-gray-300 font-medium">
                      File:{" "}
                      <span className="text-white font-mono">{fileName}</span>
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {/* View File Button (Opens in new tab, no force download) */}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-cyan-600/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Decrypted File
                    </a>

                    {/* Download Button (Forces download with the fetched filename) */}
                    <a
                      href={fileUrl}
                      download={fileName || "decrypted_file"} // USE fileName HERE
                      className="flex items-center justify-center bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-600/70 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
