import lighthouse from "@lighthouse-web3/sdk";
import type { WalletClient } from "viem";

const API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

// Sign
export const getSignedMessage = async (
  userAddress: string,
  walletClient: WalletClient,
): Promise<string> => {
  if (!userAddress || !walletClient) throw new Error("Wallet not connected.");

  const authMessage = (await lighthouse.getAuthMessage(userAddress)).data
    .message;

  // WalletClient.signMessage requires a non-null message
  const signedMessage = await walletClient.signMessage({
    account: userAddress as `0x${string}`,
    message: authMessage as string, // ensure type matches SignableMessage
  });

  return signedMessage;
};

// Upload
export const uploadEncryptedFile = async (
  fileList: FileList | File[],
  userAddress: string,
  signedMessage: string,
  progressCallback?: (progressData: {
    total: number;
    uploaded: number;
  }) => void,
) => {
  if (!API_KEY) throw new Error("Lighthouse API key missing.");

  const result = await lighthouse.uploadEncrypted(
    fileList,
    API_KEY,
    userAddress,
    signedMessage,
  );

  const cid = result.data[0].Hash;
  return cid;
};

// Share
export const shareEncryptedFile = async (
  cid: string,
  userAddress: string,
  recipientAddress: string,
  signedMessage: string,
) => {
  const response = await lighthouse.shareFile(
    userAddress,
    [recipientAddress],
    cid,
    signedMessage,
  );
  return response.data;
};

// Revoke
export const revokeEncryptedFile = async (
  cid: string,
  userAddress: string,
  recipientAddress: string,
  signedMessage: string,
) => {
  const response = await lighthouse.revokeFileAccess(
    userAddress,
    [recipientAddress],
    cid,
    signedMessage,
  );
  return response.data;
};

// Decrypt
export const decryptEncryptedFile = async (
  cid: string,
  userAddress: string,
  signedMessage: string,
) => {
  const keyResponse = await lighthouse.fetchEncryptionKey(
    cid,
    userAddress,
    signedMessage,
  );

  const decrypted = await lighthouse.decryptFile(
    cid,
    keyResponse.data.key as string,
  );

  const fileUrl = URL.createObjectURL(decrypted);
  return fileUrl;
};
