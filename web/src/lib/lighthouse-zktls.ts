// lib/lighthouse-zktls.ts

import lighthouse from "@lighthouse-web3/sdk";
import type { WalletClient } from "viem";

const API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

// No changes needed for getSignedMessage
export const getSignedMessage = async (
  userAddress: string,
  walletClient: WalletClient,
): Promise<string> => {
  // ... (same as before)
  if (!userAddress || !walletClient) throw new Error("Wallet not connected.");

  const authMessage = (await lighthouse.getAuthMessage(userAddress)).data
    .message;
  const signedMessage = await walletClient.signMessage({
    account: userAddress as `0x${string}`,
    message: authMessage as string,
  });

  return signedMessage;
};

// Function to get DataCap balance
export const getDataCapBalance = async (userAddress: string) => {
  if (!API_KEY) throw new Error("Lighthouse API key missing.");
  try {
    const response = await lighthouse.getBalance(userAddress);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch DataCap balance:", error);
    return null;
  }
};

/**
 * [MODIFIED] Uploads an encrypted file and applies zkTLS access conditions.
 * Now includes a DataCap check before applying conditions.
 */
export const uploadEncryptedFileWithZkTLS = async (
  fileList: FileList | File[],
  userAddress: string,
  signedMessage: string,
  accessConditions: any[],
  progressCallback?: (progressData: {
    total: number;
    uploaded: number;
  }) => void,
) => {
  if (!API_KEY) throw new Error("Lighthouse API key missing.");

  // Step 1: Upload the encrypted file (this part works)
  const result = await lighthouse.uploadEncrypted(
    fileList,
    API_KEY,
    userAddress,
    signedMessage,
  );

  const cid = result.data[0].Hash;
  let accessControl = null;

  // Step 2: Check for DataCap and then apply access conditions
  if (accessConditions && accessConditions.length > 0) {
    // **---- CORRECTED LOGIC STARTS HERE ----**
    const balance = await getDataCapBalance(userAddress);

    // Check if user has DataCap. Applying conditions might have a cost.
    if (balance && balance.dataLimit > 0) {
      try {
        const acResponse = await lighthouse.applyAccessCondition(
          userAddress,
          cid,
          signedMessage,
          accessConditions,
        );
        accessControl = acResponse.data || acResponse;
      } catch (error: any) {
        // This is where your original error was being thrown
        console.error("Failed to apply access conditions:", error);
        throw new Error(
          "File uploaded, but failed to apply access rules. Please ensure your API key has permissions.",
        );
      }
    } else {
      // Inform the user that the file was uploaded but conditions were not applied due to no DataCap.
      console.warn(
        "User has no DataCap. Skipping access condition application.",
      );
      throw new Error(
        "Upload successful, but access conditions were not applied due to zero DataCap balance.",
      );
    }
    // **---- CORRECTED LOGIC ENDS HERE ----**
  }

  return { cid, accessControl };
};

// No changes needed for createZkTLSConditions
export const createZkTLSConditions = (
  // ... (same as before)
  type: "github" | "google",
  params: { requiredUsername?: string; requiredEmail?: string },
) => {
  switch (type) {
    case "github":
      return [
        {
          id: 1,
          chain: "zkTLS",
          method: "github_account_verification",
          standardContractType: "",
          returnValueTest: {
            comparator: "==",
            value: params.requiredUsername || "",
          },
        },
      ];

    case "google":
      return [
        {
          id: 1,
          chain: "zkTLS",
          method: "google_account_verification",
          standardContractType: "",
          returnValueTest: {
            comparator: "==",
            value: params.requiredEmail || "",
          },
        },
      ];

    default:
      return [];
  }
};
