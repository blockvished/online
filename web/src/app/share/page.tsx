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
      setLoading(true);
      setStatus("Signing message...");

      const signedMsg = await getSignedMessage(userAddress, walletClient);

      setStatus("Sharing file access...");
      await shareEncryptedFile(cid, userAddress, recipient, signedMsg);

      setStatus(`✅ Success! Shared CID ${cid} with ${recipient}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sharing the file.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2 text-gray-800">
            <Users className="w-5 h-5 text-indigo-500" />
            Share Encrypted File
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-500">
              Please connect your wallet to continue.
            </p>
          ) : (
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Enter CID"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <input
                type="text"
                placeholder="Recipient wallet address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <Button
                onClick={handleShare}
                disabled={loading || !cid || !recipient}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sharing...
                  </>
                ) : (
                  "Share Access"
                )}
              </Button>

              {status && (
                <p className="text-sm text-gray-600 text-center">{status}</p>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
