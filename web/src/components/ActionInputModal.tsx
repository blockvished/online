"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useWalletClient } from "wagmi";
import { Address, isAddress } from "viem";

// --- ASSUMED IMPORTS: REPLACE WITH YOUR ACTUAL PROJECT PATHS ---
import {
  getSignedMessage,
  shareEncryptedFile,
  revokeEncryptedFile,
} from "@/lib/lighthouse";
import {
  useUsernameAvailability,
  getContractAddress,
} from "@/lib/hooks/useContractData";
import {
  validateUsername,
  isUsernameTaken as checkUsernameTaken,
} from "@/lib/utils/username";
// -------------------------------------------------------------

interface ActionInputModalProps {
  index: Number;
  action: "Share" | "Revoke";
  docName: string;
  cid: string;
  onClose: () => void;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const ActionInputModal = ({
  index,
  action,
  docName,
  cid,
  onClose,
}: ActionInputModalProps) => {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [recipientInput, setRecipientInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const cleanInput = recipientInput.trim().toLowerCase();
  const debouncedInput = useDebounce(cleanInput, 500); // Wait 500ms after typing stops

  // Check if current input is a valid address (immediate check, no debounce needed)
  const isInputAddress = useMemo(() => {
    if (cleanInput.length === 0) return false;

    // Check if it looks like an address (starts with 0x and has 42 chars)
    const looksLikeAddress =
      cleanInput.startsWith("0x") && cleanInput.length === 42;

    if (!looksLikeAddress) return false;

    // Use viem's isAddress for validation
    try {
      return isAddress(cleanInput);
    } catch {
      return false;
    }
  }, [cleanInput]);

  // Determine if we should check username availability
  const shouldCheckUsername = useMemo(() => {
    if (!debouncedInput || isInputAddress) return false;

    // Only check if username format is valid
    const validation = validateUsername(debouncedInput);

    // Handle if validateUsername returns an object
    if (typeof validation === "object" && validation !== null) {
      return (validation as any).isValid === true;
    }

    // If it returns a string, that's an error message
    if (typeof validation === "string") {
      return false;
    }

    // If it returns null/undefined, username is valid
    return !validation;
  }, [debouncedInput, isInputAddress]);

  // Fetch the address for the username
  const { data: usernameAddressCheck, isLoading: isUsernameCheckLoading } =
    useUsernameAvailability(shouldCheckUsername ? debouncedInput : "");

  // Check if the username is taken (exists in the contract)
  const isUsernameTaken = checkUsernameTaken(
    usernameAddressCheck as string | undefined,
    isUsernameCheckLoading,
  );

  let recipientAddress: Address | undefined;
  let validationMessage: string | null = null;
  let validationState: "loading" | "valid" | "invalid" | "none" | "typing" =
    "none";

  if (!cleanInput) {
    // Empty input - no validation
    validationState = "none";
  } else if (isInputAddress) {
    // Direct address input - ALWAYS valid if isAddress returns true
    recipientAddress = cleanInput as Address;
    validationMessage = `Target address: ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`;
    validationState = "valid";
  } else {
    // Username input - need to validate and resolve

    // First check if we're still waiting for debounce
    if (cleanInput !== debouncedInput) {
      // User is still typing - don't validate yet
      validationMessage = "Type to search username...";
      validationState = "typing";
    } else {
      // Debounce complete - now validate username format
      const validation = validateUsername(cleanInput);

      // Extract error message if validation returns an object
      let usernameError: string | null = null;
      if (typeof validation === "object" && validation !== null) {
        usernameError = (validation as any).error || null;
      } else if (typeof validation === "string") {
        usernameError = validation;
      } else {
        usernameError = validation;
      }

      if (usernameError) {
        // Invalid username format
        validationMessage = String(usernameError);
        validationState = "invalid";
      } else if (isUsernameCheckLoading) {
        // Checking username on blockchain
        validationMessage = "Checking username availability...";
        validationState = "loading";
      } else if (isUsernameTaken) {
        // Username exists - get the address
        const addressData = usernameAddressCheck as string | undefined;

        if (addressData && isAddress(addressData)) {
          recipientAddress = addressData as Address;
          validationMessage = `Username resolved to: ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`;
          validationState = "valid";
        } else {
          validationMessage = "Unable to resolve username address.";
          validationState = "invalid";
        }
      } else {
        // Username not taken (doesn't exist)
        validationMessage = "Username not found or not registered.";
        validationState = "invalid";
      }
    }
  }

  useEffect(() => {
    setError("");
    setSuccess(false);
  }, [cleanInput]);

  const handleAction = async () => {
    setError("");
    setSuccess(false);

    if (!cleanInput || !recipientAddress || validationState !== "valid") {
      setError(
        "Please enter a single, valid wallet address or registered username.",
      );
      return;
    }
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet to confirm the action.");
      return;
    }

    try {
      setLoading(true);

      setStatus("Signing transaction message...");
      const signedMsg = await getSignedMessage(userAddress, walletClient);

      setStatus(`${action}ing file access for ${cleanInput}...`);
      const actionFn =
        action === "Share" ? shareEncryptedFile : revokeEncryptedFile;
      await actionFn(cid, userAddress, recipientAddress, signedMsg);

      const response = await fetch("/api/share-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
          documentId: index,
          recipientAddress: cleanInput, // or recipientAddress if already set
          action: action.toLowerCase(), // 'share' or 'revoke'
          signedMessage: signedMsg,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API call failed");
      }

      console.log("API response:", data);

      setSuccess(true);
      setStatus(`✅ Success! ${action}d access for ${cleanInput}.`);
      setTimeout(onClose, 3000);
    } catch (err: any) {
      console.error(`Error during ${action} action:`, err);
      let errMsg = err.message || `${action} failed.`;
      if (errMsg.includes("no access")) {
        errMsg = "You may not have the necessary permissions for this action.";
      } else if (errMsg.includes("already")) {
        errMsg = `${cleanInput} ${action === "Share" ? "already has access" : "does not have access to revoke"}.`;
      }
      setError(errMsg);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const isActionReady =
    !loading &&
    !success &&
    cleanInput.length > 0 &&
    recipientAddress !== undefined &&
    validationState === "valid";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-cyan-500/20 space-y-5"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {action} Access: <span className="text-white">{docName}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input Instructions */}
        <p className="text-sm text-gray-400">
          Enter the **single** wallet address or registered username of the
          recipient to {action.toLowerCase()} access.
        </p>

        {/* Input Field */}
        <div className="relative">
          <input
            type="text"
            placeholder="Wallet Address (0x...) or Username (e.g., user1)"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            disabled={loading || success}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />

          {/* Validation/Resolution Status */}
          {cleanInput.length > 0 && validationState !== "none" && (
            <div
              className={`mt-2 text-xs font-mono p-2 rounded-lg ${
                validationState === "typing"
                  ? "bg-gray-700/30 text-gray-500"
                  : validationState === "loading"
                    ? "bg-gray-700/50 text-gray-400"
                    : validationState === "valid"
                      ? "bg-green-900/50 text-green-400"
                      : "bg-red-900/50 text-red-400"
              }`}
            >
              {validationState === "loading" ? (
                <div className="flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />{" "}
                  {validationMessage}
                </div>
              ) : validationState === "typing" ? (
                <div className="flex items-center">
                  <span>{validationMessage}</span>
                </div>
              ) : (
                <div>
                  <span className="font-semibold">
                    {validationState === "valid" ? "✓ Valid" : "✗ Invalid"}:
                  </span>{" "}
                  <span>{validationMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status/Error/Success */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />{" "}
            <span className="break-words">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-600/50 rounded-lg text-green-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />{" "}
            <span>{status}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={!isActionReady}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              {status.split("...").pop() || `${action}ing...`}
            </>
          ) : (
            `Confirm ${action}`
          )}
        </button>
      </motion.div>
    </div>
  );
};
