// components/DecryptButton.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, decryptEncryptedFile } from "@/lib/lighthouse";
import { Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";

// The full DecryptPage logic is too complex for a single button.
// We will simplify it and focus only on the core action: decryption.

interface DecryptButtonProps {
  cid: string;
  docName: string;
  className?: string;
}

export const DecryptButton = ({
  cid,
  docName,
  className = "",
}: DecryptButtonProps) => {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decrypted, setDecrypted] = useState(false);

  const handleDecrypt = async () => {
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet.");
      return;
    }
    try {
      setError("");
      setFileUrl(null);
      setDecrypted(false);
      setLoading(true);

      const signedMsg = await getSignedMessage(userAddress, walletClient);
      const url = await decryptEncryptedFile(cid, userAddress, signedMsg);

      setFileUrl(url);
      setDecrypted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Decryption failed. You may not have access.");
      setFileUrl(null);
    } finally {
      setLoading(false);
    }
  };

  if (decrypted && fileUrl) {
    return (
      <a
        href={fileUrl}
        download={docName}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-green-600/50 text-green-300 font-semibold py-2 px-3 rounded-lg hover:bg-green-600/70 transition-colors text-sm"
      >
        <CheckCircle className="w-4 h-4" /> Download Decrypted
      </a>
    );
  }

  return (
    <button
      onClick={handleDecrypt}
      disabled={loading || !isConnected}
      className={`flex items-center justify-center gap-2 bg-purple-600/50 text-purple-300 font-semibold py-2 px-3 rounded-lg hover:bg-purple-600/70 transition-colors text-sm disabled:opacity-50 ${className}`}
      title={error || "Decrypt the file using your wallet signature"}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Decrypting
        </>
      ) : (
        <>
          <KeyRound className="w-4 h-4" />
          Decrypt
        </>
      )}
    </button>
  );
};
