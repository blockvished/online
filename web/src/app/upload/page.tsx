"use client";

import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk";
import FileUpload from "./FileUpload";

const LighthouseControls = () => {
  // State for inputs and feedback
  const [cid, setCid] = useState<string>("");
  const [shareToAddress, setShareToAddress] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Wagmi hooks
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  // --- Utility Function (Used for Upload, Share, and Decrypt) ---
  const getSignedMessage = async (): Promise<string | undefined> => {
    if (!userAddress || !walletClient) {
      setStatusMessage("Wallet not connected.");
      return;
    }
    try {
      // ⚠️ Use lighthouse.getAuthMessage as intended
      const messageToSign = (await lighthouse.getAuthMessage(userAddress)).data
        .message;
      const signedMessage = await walletClient.signMessage({
        account: userAddress,
        message: messageToSign,
      });
      return signedMessage;
    } catch (error) {
      console.error("Error signing message:", error);
      setStatusMessage("Failed to sign message. Please try again.");
      return;
    }
  };

  // --- Callback Function ---
  const handleUploadSuccess = (uploadedCid: string) => {
    setCid(uploadedCid);
    setStatusMessage("CID has been set from your recent upload.");
  };

  // --- Core Functions (Share & Decrypt - Unchanged logic, rely on fixed getSignedMessage) ---

  const handleShareFile = async () => {
    if (!cid || !shareToAddress) {
      setStatusMessage("Please provide both a CID and a recipient address.");
      return;
    }
    if (!userAddress) {
      setStatusMessage("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setDecryptedFileUrl(null);
    setStatusMessage("Preparing to share... Please sign the message.");

    try {
      const signedMessage = await getSignedMessage();
      if (!signedMessage) {
        setIsLoading(false);
        return;
      }

      setStatusMessage("Sharing file access...");
      // The sharedTo address must be an array of public keys
      const shareResponse = await lighthouse.shareFile(
        userAddress,
        [shareToAddress],
        cid,
        signedMessage,
      );

      console.log("Share response:", shareResponse);
      setStatusMessage(
        `✅ Success! Shared ${shareResponse.data.cid} with ${shareToAddress}.`,
      );
    } catch (error) {
      console.error("Error sharing file:", error);
      setStatusMessage("❌ Error sharing file. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptFile = async () => {
    if (!cid) {
      setStatusMessage("Please provide a CID to decrypt.");
      return;
    }
    if (!userAddress) {
      setStatusMessage("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setDecryptedFileUrl(null);
    setStatusMessage("Preparing to decrypt... Please sign the message.");

    try {
      const signedMessage = await getSignedMessage();
      if (!signedMessage) {
        setIsLoading(false);
        return;
      }

      setStatusMessage("Fetching decryption key...");
      const fileEncryptionKey = await lighthouse.fetchEncryptionKey(
        cid,
        userAddress,
        signedMessage,
      );

      setStatusMessage("Key fetched! Decrypting file...");
      const decryptedFile = await lighthouse.decryptFile(
        cid,
        fileEncryptionKey.data.key as string,
      );

      const fileUrl = URL.createObjectURL(decryptedFile);
      setDecryptedFileUrl(fileUrl);
      setStatusMessage(`✅ File decrypted successfully!`);
    } catch (error) {
      console.error("Error decrypting file:", error);
      setStatusMessage(
        "❌ Decryption failed. You may not have access to this file, or the key is invalid.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Lighthouse Storage Manager
      </h2>

      {/* --- PASS THE SIGNING FUNCTION TO THE UPLOAD COMPONENT --- */}
      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        getSignedMessage={getSignedMessage}
      />

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>2. Share or Decrypt File</h3>
        {/* ... (rest of the inputs and buttons remain the same) ... */}
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="cid-input"
            style={{ display: "block", marginBottom: "5px" }}
          >
            File CID:
          </label>
          <input
            id="cid-input"
            type="text"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="Upload a file above or enter a CID manually"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="share-to-input"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Share To Address (Optional):
          </label>
          <input
            id="share-to-input"
            type="text"
            value={shareToAddress}
            onChange={(e) => setShareToAddress(e.target.value)}
            placeholder="Enter the recipient's 0x... address"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* --- Action Buttons --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={handleShareFile}
            disabled={isLoading || !userAddress || !shareToAddress || !cid}
            style={buttonStyle(
              isLoading || !userAddress || !shareToAddress || !cid,
            )}
          >
            {isLoading ? "Sharing..." : "Share Access"}
          </button>
          <button
            onClick={handleDecryptFile}
            disabled={isLoading || !userAddress || !cid}
            style={buttonStyle(isLoading || !userAddress || !cid)}
          >
            {isLoading ? "Decrypting..." : "Decrypt File"}
          </button>
        </div>
      </div>

      {/* --- Status & Output --- */}
      {statusMessage && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <p>{statusMessage}</p>
        </div>
      )}

      {decryptedFileUrl && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <h3>Decrypted File:</h3>
          <a
            href={decryptedFileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0070f3", textDecoration: "none" }}
          >
            Click here to view or download
          </a>
          <p style={{ fontSize: "0.8em", color: "#666" }}>
            Note: This is a temporary local URL for the decrypted content.
          </p>
        </div>
      )}
    </div>
  );
};

// Simple styling function for buttons
const buttonStyle = (disabled: boolean) => ({
  padding: "10px 20px",
  fontSize: "16px",
  cursor: disabled ? "not-allowed" : "pointer",
  backgroundColor: disabled ? "#ccc" : "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "5px",
  opacity: disabled ? 0.6 : 1,
});

export default LighthouseControls;
