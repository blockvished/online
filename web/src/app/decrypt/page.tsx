"use client";

import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, decryptEncryptedFile } from "@/lib/lighthouse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";

export default function DownloadPage() {
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
      setLoading(true);
      setStatus("Signing message...");

      const signedMsg = await getSignedMessage(userAddress, walletClient);

      setStatus("Decrypting file...");
      const url = await decryptEncryptedFile(cid, userAddress, signedMsg);

      setFileUrl(url);
      setStatus("✅ File decrypted!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during decryption.");
      setFileUrl(null);
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
            <FileText className="w-5 h-5 text-green-500" />
            Decrypt Encrypted File
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-500">
              Please connect your wallet to continue.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <input
                type="text"
                placeholder="Enter CID of the encrypted file"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <Button
                onClick={handleDecrypt}
                disabled={loading || !cid}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Decrypting...
                  </>
                ) : (
                  "Decrypt File"
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

              {fileUrl && (
                <div className="mt-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>File decrypted successfully!</span>
                  </div>
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    className="text-green-500 hover:underline text-sm"
                  >
                    View / Download Decrypted File
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
