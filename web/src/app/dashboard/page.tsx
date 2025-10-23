"use client";

import { useAccount, useContractRead } from "wagmi";
import { Address } from "viem";
import Link from "next/link";
import { useState } from "react";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";
import { usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | Address
  | undefined;

// --- Helper Components & Functions ---

// 1. StatusBadge component remains the same
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
  if (value && value !== "") {
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

// Username validation function remains the same
const validateUsername = (
  username: string,
): { isValid: boolean; error: string } => {
  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }
  if (!/^[a-zA-Z]/.test(username)) {
    return { isValid: false, error: "Username must start with a letter" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }
  return { isValid: true, error: "" };
};

// --- Main Component ---

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [usernameInput, setUsernameInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // 1. Fetch Current Username (Remains the same)
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

  // 2. NEW: Check if the *input* username is already taken
  // This reads the usernameToAddress mapping for the currently typed input.
  const { data: usernameAddressCheck, isLoading: isUsernameCheckLoading } =
    useContractRead({
      address: CONTRACT_ADDRESS,
      abi: SEAL_ENCRYPT_ABI,
      functionName: "usernameToAddress",
      args: [usernameInput],
      // Only query if the user is connected, the contract exists, and the input is valid/not empty
      enabled:
        isConnected &&
        !!CONTRACT_ADDRESS &&
        validateUsername(usernameInput).isValid &&
        usernameInput !== username,
      watch: true,
    });

  // Logic to determine if the input username is taken
  const isUsernameTaken =
    !isUsernameCheckLoading &&
    usernameAddressCheck !== undefined &&
    usernameAddressCheck !== "0x0000000000000000000000000000000000000000"; // Check against zero address

  // Fetch Document Count
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

  const docCountValue = documentCount !== undefined ? Number(documentCount) : 0;
  const isAccountActivated = !!username;

  // --- Handlers ---

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsernameInput(value);

    // Clear UI state on change
    if (validationError) setValidationError("");
    if (txSuccess) setTxSuccess(false);
    if (txHash) setTxHash("");
  };

  const handleCancelUpdate = () => {
    setShowUpdateForm(false);
    setUsernameInput("");
    setValidationError("");
    setTxSuccess(false);
    setTxHash("");
  };

  const handleSetUsername = async () => {
    const validation = validateUsername(usernameInput);

    // Initial client-side validation
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // NEW: Check if the username is taken based on the contract read result
    if (isUsernameTaken) {
      setValidationError("Username is already taken. Please choose another.");
      return;
    }

    // Check if the user is attempting to set their current username
    if (usernameInput === username) {
      setValidationError("This is your current username.");
      return;
    }

    if (!walletClient || !publicClient || !CONTRACT_ADDRESS) {
      setValidationError("Wallet not connected properly");
      return;
    }

    setIsSettingUsername(true);
    setValidationError("");
    setTxSuccess(false);

    try {
      const sealEncrypt = getContract({
        address: CONTRACT_ADDRESS,
        abi: SEAL_ENCRYPT_ABI,
        client: { public: publicClient, wallet: walletClient },
      });

      const hash = await sealEncrypt.write.setUsername([usernameInput]);
      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setTxSuccess(true);
        setUsernameInput("");
        setTimeout(() => {
          refetchUsername();
          setShowUpdateForm(false);
        }, 1500);
      } else {
        setValidationError("Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error setting username:", error);
      setValidationError(
        error?.message?.includes("rejected")
          ? "Transaction rejected by user"
          : "Failed to set username. Please try again.",
      );
    } finally {
      setIsSettingUsername(false);
    }
  };

  // Determine button state and message
  const isValidClientSide = validateUsername(usernameInput).isValid;
  const isButtonDisabled =
    !usernameInput ||
    isSettingUsername ||
    !isValidClientSide ||
    isUsernameCheckLoading ||
    isUsernameTaken ||
    (isAccountActivated && usernameInput === username);

  // --- Render logic ---

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="relative flex-grow flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <h2 className="text-2xl font-bold mb-4 text-red-300">
          🚨 Configuration Error
        </h2>
        <p className="text-lg">
          The contract address (
          <code className="bg-red-800/50 p-1 rounded">
            NEXT_PUBLIC_CONTRACT_ADDRESS
          </code>
          ) is not set in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 bg-gray-950 text-white min-h-[calc(100vh-8rem)]">
      <h1 className="text-5xl font-extrabold mb-12 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 shadow-text-lg">
        🔒 SealEncrypt Dashboard
      </h1>

      <div className="w-full max-w-lg space-y-8">
        {/* 1. User Data Card */}
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

              {/* Username Display AND Button */}
              <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-300 font-medium">Username:</p>
                <div className="flex items-center space-x-3">
                  <StatusBadge
                    isLoading={isUsernameLoading}
                    value={username as string}
                    emptyMessage="Not Set"
                    colorClass="bg-green-700/50 text-green-300"
                  />

                  {/* Update/Change Button (visible if activated and form is hidden) */}
                  {isAccountActivated && !showUpdateForm && (
                    <button
                      onClick={() => {
                        setShowUpdateForm(true);
                        setUsernameInput((username as string) || ""); // Pre-fill current username
                      }}
                      className="text-xs font-medium text-blue-300 bg-gray-600/50 hover:bg-gray-600/70 py-1.5 px-3 rounded-lg transition-colors border border-blue-500/30"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Document Count */}
              {isAccountActivated && (
                <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-gray-300 font-medium">
                    Documents Uploaded:
                  </p>
                  <StatusBadge
                    isLoading={isDocCountLoading}
                    value={docCountValue}
                    emptyMessage="0"
                    colorClass={
                      docCountValue > 0
                        ? "bg-blue-700/50 text-blue-300"
                        : "bg-gray-600 text-gray-400"
                    }
                  />
                </div>
              )}

              {/* Username Update Form (Conditional: Appears when 'Change' is clicked) */}
              {isAccountActivated && showUpdateForm && (
                <div className="p-4 mt-4 bg-blue-900/30 border border-blue-600/50 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-blue-300">
                    Update Username
                  </h3>
                  <div className="text-left">
                    <label
                      htmlFor="username-update"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      New Username
                    </label>
                    <input
                      id="username-update"
                      type="text"
                      value={usernameInput}
                      onChange={handleUsernameChange}
                      placeholder={`Current: ${username}`}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      disabled={isSettingUsername}
                    />
                  </div>

                  {/* Display network/validation errors here */}
                  {(validationError ||
                    isUsernameTaken ||
                    isUsernameCheckLoading) && (
                    <p
                      className={`text-sm font-medium animate-pulse ${isUsernameTaken ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {isUsernameCheckLoading && usernameInput.length > 0
                        ? "⏳ Checking availability..."
                        : isUsernameTaken
                          ? "🛑 Username is already taken."
                          : validationError
                            ? `🛑 ${validationError}`
                            : ""}
                    </p>
                  )}

                  {txSuccess && (
                    <div className="p-3 bg-green-900/50 border border-green-600 rounded-lg text-green-300 text-sm space-y-1">
                      <p className="font-semibold">✓ Username updated!</p>
                      {txHash && (
                        <p className="text-xs text-gray-400">
                          Tx Hash: {txHash.slice(0, 10)}...
                          {txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSetUsername}
                      disabled={isButtonDisabled}
                      className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {isSettingUsername ? "Updating..." : "Update"}
                    </button>
                    <button
                      onClick={handleCancelUpdate}
                      disabled={isSettingUsername}
                      className="flex-1 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Account Status and Actions Section */}
        {isConnected && !isUsernameLoading && (
          <div className="text-center pt-4 space-y-6">
            {!isAccountActivated ? (
              // Initial Activation Form (Requires the same availability check)
              <div className="p-8 bg-purple-900/40 border border-purple-600 rounded-xl shadow-xl space-y-6">
                <h3 className="text-2xl font-bold text-purple-300">
                  🚀 Activate Your Account
                </h3>
                <p className="text-purple-200/80">
                  Choose your unique username to start using SealEncrypt.
                </p>

                <div className="space-y-4">
                  <div className="text-left">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-purple-300 mb-2"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={usernameInput}
                      onChange={handleUsernameChange}
                      placeholder="Enter username (e.g., alice_123)"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      disabled={isSettingUsername}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Starts with a letter, min 3 chars, alphanumeric and
                      underscores.
                    </p>
                  </div>

                  {/* Display network/validation errors here */}
                  {(validationError ||
                    isUsernameTaken ||
                    isUsernameCheckLoading) && (
                    <p
                      className={`text-sm font-medium animate-pulse ${isUsernameTaken ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {isUsernameCheckLoading && usernameInput.length > 0
                        ? "⏳ Checking availability..."
                        : isUsernameTaken
                          ? "🛑 Username is already taken."
                          : validationError
                            ? `🛑 ${validationError}`
                            : ""}
                    </p>
                  )}

                  {txSuccess && (
                    <div className="p-3 bg-green-900/50 border border-green-600 rounded-lg text-green-300 text-sm space-y-1">
                      <p className="font-semibold">✓ Username registered!</p>
                      {txHash && (
                        <p className="text-xs text-gray-400">
                          Tx Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleSetUsername}
                    // Use the general button disabled logic
                    disabled={isButtonDisabled}
                    className="w-full text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isSettingUsername
                      ? "⏳ Registering Username..."
                      : "Register Username"}
                  </button>
                </div>
              </div>
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
                      href="/decrypt"
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
