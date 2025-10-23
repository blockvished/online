"use client";

import { useAccount, useContractRead } from "wagmi";
import { Address } from "viem";
import Link from "next/link";
import { useState, useMemo } from "react";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";
import { usePublicClient, useWalletClient } from "wagmi";

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | Address
  | undefined;

// --- StatusBadge Component (Unchanged) ---
const StatusBadge = ({
  isLoading,
  value,
  emptyMessage,
  colorClass,
}: {
  isLoading: boolean;
  value: string | number | undefined;
  emptyMessage: string;
  colorClass: string;
}) => {
  if (isLoading)
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 animate-pulse">
        ⏳ Loading...
      </span>
    );

  if (value) {
    return (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-400">
      🚫 {emptyMessage}
    </span>
  );
};

// --- DocumentDisplay Component (New) ---
// A separate component to handle fetching and displaying a single document
const DocumentDisplay = ({
  userAddress,
  index,
  isEnabled,
}: {
  userAddress: Address;
  index: number;
  isEnabled: boolean;
}) => {
  const { data: document, isLoading: isDocumentLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "getDocument",
    args: [userAddress, BigInt(index)], // The index must be passed as BigInt or string if the ABI expects uint256
    enabled: isEnabled && !!CONTRACT_ADDRESS,
    watch: true,
  });

  if (!isEnabled) return null; // Don't render if not enabled

  if (isDocumentLoading) {
    return <p className="text-gray-500">Loading Document #{index}...</p>;
  }

  if (document) {
    // Assuming 'document' is the returned tuple
    const docData = document as {
      owner: Address;
      cid: string;
      unlockTime: bigint;
      price: bigint;
      recipients: Address[];
      encrypted: boolean;
    };

    return (
      <div className="p-4 border-b border-gray-700 last:border-b-0">
        <h3 className="text-lg font-semibold text-cyan-400">
          Document #{index}
        </h3>
        <p className="text-sm">
          **CID (IPFS Hash):**{" "}
          <code className="bg-gray-700 p-0.5 rounded text-xs text-white break-all">
            {docData.cid}
          </code>
        </p>
        <p className="text-sm">
          **Encrypted:** {docData.encrypted ? "✅ Yes" : "❌ No"}
        </p>
        {/* You can add more details or a link here */}
        <Link
          href={`/documents/${index}?cid=${docData.cid}`}
          className="text-purple-400 hover:text-purple-300 text-sm mt-2 block"
        >
          View Details &rarr;
        </Link>
      </div>
    );
  }

  return <p className="text-red-400">Could not load Document #{index}.</p>;
};

// --- Main Component ---
export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Fetch username
  const {
    data: username,
    isLoading: isUsernameLoading,
    refetch: refetchUsername,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "usernames",
    args: [address as Address],
    enabled: isConnected && !!CONTRACT_ADDRESS,
    watch: true,
  });

  // Fetch document count
  const { data: documentCount, isLoading: isDocCountLoading } = useContractRead(
    {
      address: CONTRACT_ADDRESS,
      abi: SEAL_ENCRYPT_ABI,
      functionName: "documentCount",
      args: [address as Address],
      enabled: isConnected && !!CONTRACT_ADDRESS,
      watch: true,
    },
  );

  const docCountValue = useMemo(
    () => Number(documentCount ?? 0),
    [documentCount],
  );
  const isAccountActivated = !!username;

  // --- NEW: Create an array of document indices to map over ---
  const documentIndices = useMemo(() => {
    // Create an array from 1 up to docCountValue (inclusive)
    return Array.from({ length: docCountValue }, (_, i) => i + 1);
  }, [docCountValue]);

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="relative flex-grow flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <h2 className="text-2xl font-bold mb-4 text-red-300">
          🚨 Configuration Error
        </h2>
        <p className="text-lg">
          The contract address{" "}
          <code className="bg-red-800/50 p-1 rounded">
            NEXT_PUBLIC_CONTRACT_ADDRESS
          </code>{" "}
          is not set in your environment variables.
        </p>
      </div>
    );
  }

  const isDataReady = isConnected && isAccountActivated && !isDocCountLoading;

  return (
    <div className="flex flex-col items-center p-8 bg-gray-950 text-white min-h-[calc(100vh-8rem)]">
      <h1 className="text-5xl font-extrabold mb-12 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 shadow-text-lg">
        🔒 SealEncrypt Encrypted Data
      </h1>

      <div className="w-full max-w-lg space-y-8">
        <div className="p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
          {!isConnected ? (
            <p className="text-yellow-400 text-center py-6 text-lg font-medium">
              Wallet not connected. Connect your wallet to load your data.
            </p>
          ) : isAccountActivated ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p>Documents Uploaded by **{username}**:</p>
                <StatusBadge
                  isLoading={isDocCountLoading}
                  value={docCountValue}
                  emptyMessage="0"
                  colorClass={
                    docCountValue > 0
                      ? "ml-4 bg-blue-700/50 text-blue-300"
                      : "bg-gray-600 text-gray-400"
                  }
                />
              </div>

              {/* --- NEW: Document List --- */}
              <div className="mt-6 p-4 bg-gray-900 rounded-xl max-h-96 overflow-y-auto border border-gray-700">
                {isDataReady && docCountValue > 0 ? (
                  documentIndices.map((index) => (
                    <DocumentDisplay
                      key={index}
                      userAddress={address as Address}
                      index={index}
                      isEnabled={isDataReady}
                    />
                  ))
                ) : isDataReady && docCountValue === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No documents uploaded yet.
                  </p>
                ) : (
                  <p className="text-gray-500 text-center py-4 animate-pulse">
                    Loading documents...
                  </p>
                )}
              </div>
              {/* --- End Document List --- */}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No account data found. Please set up your username.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
