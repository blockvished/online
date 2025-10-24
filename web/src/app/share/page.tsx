"use client";

import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, shareEncryptedFile } from "@/lib/lighthouse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";

export default function SharePage() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [cid, setCid] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    if (!cid || !recipient) {
      setError("Please provide both CID and recipient address.");
      return;
    }
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setError("");
      // Reset status for loading feedback
      setStatus("Preparing to share...");
      setLoading(true);

      // Step 1: Sign the message
      setStatus("Signing message...");
      const signedMsg = await getSignedMessage(userAddress, walletClient);

      // Step 2: Share file access
      setStatus("Sharing file access...");
      await shareEncryptedFile(cid, userAddress, recipient, signedMsg);

      setStatus(
        `✅ Success! Shared CID ${cid.slice(0, 10)}... with ${recipient.slice(0, 6)}...`,
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sharing the file.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  // Determine if the action is ready (connected, not loading, fields filled)
  const isActionReady =
    isConnected && !loading && cid.length > 0 && recipient.length > 0;

  return (
    // 1. Dark background container (Similar to ActionInputModal backdrop)
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      {/* 2. Card with dark theme and gradient border */}
      <Card className="w-full max-w-md shadow-2xl bg-gray-800 text-white border border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            {/* 3. Gradient text for the title */}
            <Users className="w-6 h-6 text-cyan-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Share Encrypted File Access
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-400">
              Please connect your wallet to share file access.
            </p>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* 4. Dark themed input fields */}
              <input
                type="text"
                placeholder="Enter CID (Content ID)"
                value={cid}
                onChange={(e) => {
                  setCid(e.target.value);
                  setError("");
                  setStatus("");
                }}
                disabled={loading}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />

              <input
                type="text"
                placeholder="Recipient wallet address (0x...)"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setError("");
                  setStatus("");
                }}
                disabled={loading}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />

              {/* 5. Gradient Action Button (Similar to ActionInputModal) */}
              <Button
                onClick={handleShare}
                disabled={!isActionReady}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    {status.split("...").pop() || "Processing..."}
                  </>
                ) : (
                  "Confirm Share Access"
                )}
              </Button>

              {/* Status/Error Messages */}
              {status && !error && !status.startsWith("✅") && (
                <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>{status}</span>
                </div>
              )}

              {status.startsWith("✅") && (
                <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-600/50 rounded-lg text-green-400 font-semibold text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{" "}
                  <span>{status.substring(2)}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />{" "}
                  <span className="break-words">{error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
