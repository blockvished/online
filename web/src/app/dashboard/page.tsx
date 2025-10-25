"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { useState } from "react";
import {
  useUsername,
  useDocumentCount,
  getContractAddress,
} from "@/lib/hooks/useContractData";
import { ConfigError } from "@/components/ConfigError";
import { PageHeader } from "@/components/PageHeader";
import { UserDataCard } from "@/components/UserDataCard";
import { UsernameForm } from "@/components/UsernameForm";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const CONTRACT_ADDRESS = getContractAddress();

  // Fetch user data using custom hooks
  const {
    data: username,
    isLoading: isUsernameLoading,
    refetch: refetchUsername,
  } = useUsername();

  const { data: documentCount, isLoading: isDocCountLoading } =
    useDocumentCount();

  const docCountValue = documentCount !== undefined ? Number(documentCount) : 0;
  const isAccountActivated = !!username;

  // Handlers
  const handleUsernameUpdateSuccess = () => {
    refetchUsername();
    setShowUpdateForm(false);
  };

  const handleCancelUpdate = () => {
    setShowUpdateForm(false);
  };

  // Configuration check
  if (!CONTRACT_ADDRESS) {
    return <ConfigError />;
  }

  return (
    <div className="flex flex-col items-center p-8 bg-gray-950 text-white min-h-[calc(100vh-8rem)]">
      <PageHeader title="SealEncrypt Dashboard" />

      <div className="w-full max-w-lg space-y-8">
        {/* User Data Card */}
        <UserDataCard
          isConnected={isConnected}
          address={address}
          username={username as string}
          isUsernameLoading={isUsernameLoading}
          documentCount={docCountValue}
          isDocCountLoading={isDocCountLoading}
          showDocumentCount={isAccountActivated}
          showChangeButton={!showUpdateForm}
          onChangeUsername={() => setShowUpdateForm(true)}
        />

        {/* Username Update Form */}
        {isAccountActivated && showUpdateForm && (
          <UsernameForm
            currentUsername={username as string}
            mode="update"
            onSuccess={handleUsernameUpdateSuccess}
            onCancel={handleCancelUpdate}
          />
        )}

        {/* Account Status and Actions Section */}
        {isConnected && !isUsernameLoading && (
          <div className="text-center pt-4 space-y-6">
            {!isAccountActivated ? (
              // Initial Activation Form
              <UsernameForm
                mode="register"
                onSuccess={() => refetchUsername()}
              />
            ) : (
              // User is Activated - Primary Actions Card
              <div className="p-6 bg-gray-800/80 rounded-2xl shadow-xl border border-gray-700/50 space-y-6">
                <h3 className="text-xl font-bold text-green-400 mb-4">
                  Account Active!
                </h3>

                {/* Documents Section */}
                <div className="space-y-4">
                  {!isDocCountLoading && docCountValue > 0 ? (
                    <Link
                      href="/documents"
                      className="block w-full text-center text-lg font-bold text-blue-300 bg-blue-900/30 hover:bg-blue-800/50 py-3 px-4 rounded-xl transition-colors ring-2 ring-blue-500/50 hover:ring-blue-400/70"
                    >
                      View Your {docCountValue} Document
                      {docCountValue > 1 ? "s" : ""} &rarr;
                    </Link>
                  ) : !isDocCountLoading && docCountValue === 0 ? (
                    <h3 className="text-xl font-medium text-gray-400 italic py-2">
                      You have no documents uploaded.
                    </h3>
                  ) : null}

                  {!isDocCountLoading && (
                    <Link
                      href="/upload"
                      className="block w-full text-lg font-bold text-white bg-green-600 hover:bg-green-700 py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      ⬆️ Upload New Document
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
