// components/UserDataCard.tsx
import { Address } from "viem";
import { StatusBadge } from "./StatusBadge";

interface UserDataCardProps {
  isConnected: boolean;
  address?: Address;
  username?: string;
  isUsernameLoading: boolean;
  documentCount?: number;
  isDocCountLoading: boolean;
  showDocumentCount?: boolean;
  showChangeButton?: boolean;
  onChangeUsername?: () => void;
}

export const UserDataCard = ({
  isConnected,
  address,
  username,
  isUsernameLoading,
  documentCount = 0,
  isDocCountLoading,
  showDocumentCount = true,
  showChangeButton = false,
  onChangeUsername,
}: UserDataCardProps) => {
  const isAccountActivated = !!username;

  return (
    <div className="p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50">
      <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-700 pb-3 flex items-center gap-2">
        🔗 On-Chain User Data
      </h2>

      {!isConnected ? (
        <p className="text-yellow-400 text-center py-6 text-lg font-medium">
          Wallet not connected. Connect your wallet to load your data.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
            <p className="text-gray-300 font-medium">Wallet Address:</p>
            <code className="text-sm text-blue-400 font-mono tracking-wider bg-gray-900 px-2 py-1 rounded-md">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </code>
          </div>

          {/* Username Display */}
          <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
            <p className="text-gray-300 font-medium">Username:</p>
            <div className="flex items-center space-x-3">
              <StatusBadge
                isLoading={isUsernameLoading}
                value={username as string}
                emptyMessage="Not Set"
                colorClass="bg-green-700/50 text-green-300"
              />

              {isAccountActivated && showChangeButton && onChangeUsername && (
                <button
                  onClick={onChangeUsername}
                  className="text-xs font-medium text-blue-300 bg-gray-600/50 hover:bg-gray-600/70 py-1.5 px-3 rounded-lg transition-colors border border-blue-500/30"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Document Count */}
          {isAccountActivated && showDocumentCount && (
            <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
              <p className="text-gray-300 font-medium">Documents Uploaded:</p>
              <StatusBadge
                isLoading={isDocCountLoading}
                value={documentCount}
                emptyMessage="0"
                colorClass={
                  documentCount > 0
                    ? "bg-blue-700/50 text-blue-300"
                    : "bg-gray-600 text-gray-400"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
