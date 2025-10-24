"use client";

import { useAccount } from "wagmi";
import { useMemo, useState } from "react"; // ADDED: useState
import {
  useUsername,
  useDocumentCount,
  getContractAddress,
} from "@/lib/hooks/useContractData";
import { ConfigError } from "@/components/ConfigError";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentList } from "@/components/DocumentDisplay";

// Define the two possible view modes
type ViewMode = "list" | "grid";

export default function ShowDocuments() {
  const { address, isConnected } = useAccount();
  const CONTRACT_ADDRESS = getContractAddress();

  // ADDED: State for the view mode, default to 'list'
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  // Helper component for the view mode toggle buttons
  const ViewModeToggle = () => (
    <div className="flex bg-gray-700/50 rounded-lg p-1 space-x-1">
      <button
        onClick={() => setViewMode("list")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
          viewMode === "list"
            ? "bg-blue-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-700"
        }`}
        aria-label="Switch to List View"
      >
        {/* List Icon SVG */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
      <button
        onClick={() => setViewMode("grid")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
          viewMode === "grid"
            ? "bg-blue-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-700"
        }`}
        aria-label="Switch to Grid View"
      >
        {/* Grid Icon SVG */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>
    </div>
  );
  // END Helper component

  return (
    <div className="flex flex-col items-center p-8 bg-gray-950 text-white min-h-[calc(100vh-8rem)]">
      <PageHeader title="SealEncrypt Encrypted Data" />

      <div className="w-full max-w-4xl space-y-8">
        <div className="p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
          {!isConnected ? (
            <p className="text-yellow-400 text-center py-6 text-lg font-medium">
              Wallet not connected. Connect your wallet to load your data.
            </p>
          ) : isAccountActivated ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <p className="text-gray-300 font-medium pt-1">
                  Documents Uploaded by{" "}
                  <span className="font-bold text-white">{username}</span>:
                </p>

                {/* Grouping the StatusBadge and ViewModeToggle to stay together on the right */}
                <div className="flex items-center space-x-3">
                  <StatusBadge
                    isLoading={isDocCountLoading}
                    value={`${docCountValue} ${docCountValue === 1 ? "Document" : "Documents"}`}
                    emptyMessage="0"
                    colorClass={
                      docCountValue > 0
                        ? "bg-blue-700/50 text-blue-300" // Removed ml-4
                        : "bg-gray-600 text-gray-400"
                    }
                  />
                  {isConnected && isAccountActivated && <ViewModeToggle />}
                </div>
              </div>

              {/* Document List - UPDATED: Pass viewMode prop */}
              <DocumentList
                userAddress={address}
                documentCount={docCountValue}
                isDataReady={isDataReady}
                viewMode={viewMode} // ADDED PROP
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
