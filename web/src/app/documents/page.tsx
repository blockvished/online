"use client";

import { useAccount } from "wagmi";
import { useMemo } from "react";
import {
  useUsername,
  useDocumentCount,
  getContractAddress,
} from "@/lib/hooks/useContractData";
import { ConfigError } from "@/components/ConfigError";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentList } from "@/components/DocumentDisplay";

export default function DecryptPage() {
  const { address, isConnected } = useAccount();
  const CONTRACT_ADDRESS = getContractAddress();

  // Fetch user data using custom hooks
  const { data: username, isLoading: isUsernameLoading } = useUsername();

  const { data: documentCount, isLoading: isDocCountLoading } =
    useDocumentCount();

  const docCountValue = useMemo(
    () => Number(documentCount ?? 0),
    [documentCount],
  );
  const isAccountActivated = !!username;

  // Configuration check
  if (!CONTRACT_ADDRESS) {
    return <ConfigError />;
  }

  const isDataReady = isConnected && isAccountActivated && !isDocCountLoading;

  return (
    <div className="flex flex-col items-center p-8 bg-gray-950 text-white min-h-[calc(100vh-8rem)]">
      <PageHeader title="SealEncrypt Encrypted Data" />

      <div className="w-full max-w-lg space-y-8">
        <div className="p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
          {!isConnected ? (
            <p className="text-yellow-400 text-center py-6 text-lg font-medium">
              Wallet not connected. Connect your wallet to load your data.
            </p>
          ) : isAccountActivated ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-medium">
                  Documents Uploaded by{" "}
                  <span className="font-bold text-white">{username}</span>:
                </p>
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

              {/* Document List */}
              <DocumentList
                userAddress={address}
                documentCount={docCountValue}
                isDataReady={isDataReady}
              />
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
