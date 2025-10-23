"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, decryptEncryptedFile } from "@/lib/lighthouse";
import { Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";

export default function DecryptPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [cid, setCid] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
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
      setLoading(true);
      setStatus("Signing message...");
      const signedMsg = await getSignedMessage(userAddress, walletClient);
      setStatus("Requesting decryption key...");
      const url = await decryptEncryptedFile(cid, userAddress, signedMsg);
      setFileUrl(url);
      setStatus("File decrypted successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Decryption failed. You may not have access.");
      setFileUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-blue-900/30 via-purple-900/10 to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-gray-950/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <KeyRound className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Decrypt File</h2>
        </div>

        <div className="space-y-6">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Please connect your wallet to continue.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <input
                type="text"
                placeholder="Enter file CID to decrypt"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />

              <button
                onClick={handleDecrypt}
                disabled={loading || !cid}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Decrypting...
                  </>
                ) : (
                  "Decrypt File"
                )}
              </button>

              {loading && (
                <p className="text-sm text-gray-400 text-center">{status}</p>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {fileUrl && !loading && (
                <div className="text-center space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      Decryption successful!
                    </span>
                  </div>
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500/20 text-green-300 px-4 py-2 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
                  >
                    Download Decrypted File
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
