// components/UsernameForm.tsx
import { useState } from "react";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";
import {
  validateUsername,
  isUsernameTaken as checkUsernameTaken,
} from "@/lib/utils/username";
import {
  useUsernameAvailability,
  getContractAddress,
} from "@/lib/hooks/useContractData";

interface UsernameFormProps {
  currentUsername?: string;
  mode: "register" | "update";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UsernameForm = ({
  currentUsername = "",
  mode,
  onSuccess,
  onCancel,
}: UsernameFormProps) => {
  const [usernameInput, setUsernameInput] = useState(currentUsername);
  const [validationError, setValidationError] = useState("");
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: usernameAddressCheck, isLoading: isUsernameCheckLoading } =
    useUsernameAvailability(usernameInput);

  const isUsernameTaken = checkUsernameTaken(
    usernameAddressCheck as string | undefined,
    isUsernameCheckLoading,
  );

  const CONTRACT_ADDRESS = getContractAddress();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsernameInput(value);
    if (validationError) setValidationError("");
    if (txSuccess) setTxSuccess(false);
    if (txHash) setTxHash("");
  };

  const handleSetUsername = async () => {
    const validation = validateUsername(usernameInput);

    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    if (isUsernameTaken) {
      setValidationError("Username is already taken. Please choose another.");
      return;
    }

    if (usernameInput === currentUsername) {
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
          onSuccess?.();
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

  const isValidClientSide = validateUsername(usernameInput).isValid;
  const isButtonDisabled =
    !usernameInput ||
    isSettingUsername ||
    !isValidClientSide ||
    isUsernameCheckLoading ||
    isUsernameTaken ||
    (mode === "update" && usernameInput === currentUsername);

  const isRegisterMode = mode === "register";

  return (
    <div
      className={`space-y-4 ${isRegisterMode ? "p-8 bg-purple-900/40 border border-purple-600 rounded-xl shadow-xl" : "p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg"}`}
    >
      {isRegisterMode && (
        <>
          <h3 className="text-2xl font-bold text-purple-300">
            🚀 Activate Your Account
          </h3>
          <p className="text-purple-200/80">
            Choose your unique username to start using SealEncrypt.
          </p>
        </>
      )}

      {!isRegisterMode && (
        <h3 className="text-lg font-semibold text-blue-300">Update Username</h3>
      )}

      <div className="text-left">
        <label
          htmlFor={`username-${mode}`}
          className="block text-sm font-medium mb-2"
          style={{
            color: isRegisterMode ? "rgb(216 180 254)" : "rgb(209 213 219)",
          }}
        >
          {isRegisterMode ? "Username" : "New Username"}
        </label>
        <input
          id={`username-${mode}`}
          type="text"
          value={usernameInput}
          onChange={handleUsernameChange}
          placeholder={
            isRegisterMode
              ? "Enter username (e.g., alice_123)"
              : `Current: ${currentUsername}`
          }
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          disabled={isSettingUsername}
        />
        {isRegisterMode && (
          <p className="text-xs text-gray-400 mt-2">
            Starts with a letter, min 3 chars, alphanumeric and underscores.
          </p>
        )}
      </div>

      {(validationError || isUsernameTaken || isUsernameCheckLoading) && (
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
          <p className="font-semibold">
            ✓ Username {isRegisterMode ? "registered" : "updated"}!
          </p>
          {txHash && (
            <p className="text-xs text-gray-400">
              Tx Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          )}
        </div>
      )}

      <div className={isRegisterMode ? "" : "flex gap-3 pt-2"}>
        <button
          onClick={handleSetUsername}
          disabled={isButtonDisabled}
          className={`font-bold text-white transition-all duration-300 disabled:cursor-not-allowed ${
            isRegisterMode
              ? "w-full text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none"
              : "flex-1 text-sm bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg disabled:bg-gray-600"
          }`}
        >
          {isSettingUsername
            ? isRegisterMode
              ? "⏳ Registering Username..."
              : "Updating..."
            : isRegisterMode
              ? "Register Username"
              : "Update"}
        </button>

        {!isRegisterMode && (
          <button
            onClick={onCancel}
            disabled={isSettingUsername}
            className="flex-1 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
