"use client";

import React, { useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { useAccount } from "wagmi"; // ⚠️ IMPORT useAccount here to ensure userAddress is available

interface FileUploadProps {
  // ⚠️ New prop: A function to get the signed message for encryption
  getSignedMessage: () => Promise<string | undefined>;
  onUploadSuccess: (cid: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  getSignedMessage, // ⚠️ Destructure the new prop
}) => {
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use useAccount to get the public key needed for uploadEncrypted
  const { address: userAddress } = useAccount();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

    if (!apiKey) {
      setStatusMessage(
        "❌ Lighthouse API key not found in environment variables.",
      );
      return;
    }
    if (!userAddress) {
      setStatusMessage("❌ Please connect your wallet to encrypt and upload.");
      return;
    }
    if (!e.target.files || e.target.files.length === 0) {
      setStatusMessage("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Preparing to encrypt... Please sign the message.");
    setUploadProgress(0);

    try {
      // 1. Get Signed Message for Encryption
      const signedMessage = await getSignedMessage();
      if (!signedMessage) {
        setStatusMessage("❌ Upload cancelled. Message signing failed.");
        setIsLoading(false);
        return;
      }

      // 2. Define progress callback
      const progressCallback = (progressData: {
        total: number;
        uploaded: number;
      }) => {
        const percentage = Math.round(
          (progressData.uploaded / progressData.total) * 100,
        );
        setUploadProgress(percentage);
        setStatusMessage(`Uploading Encrypted File... ${percentage}%`);
      };

      // 3. ⚠️ FIX: Use uploadEncrypted instead of upload
      const output = await lighthouse.uploadEncrypted(
        e.target.files, // FileList
        apiKey,
        userAddress, // Public Key
        signedMessage, // Signed Auth Message
        progressCallback,
      );

      const cid = output.data[0].Hash; // ⚠️ The response structure is an array for uploadEncrypted
      console.log("Encrypted File Uploaded:", output);
      setStatusMessage(`✅ Encrypted Upload successful! CID: ${cid}`);

      onUploadSuccess(cid);
    } catch (error) {
      console.error("Error uploading encrypted file:", error);
      setStatusMessage("❌ Error uploading file. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>1. Upload an Encrypted File</h3>
      <p>
        Select a file to encrypt, upload, and get a CID (Requires wallet
        connection).
      </p>

      <input
        type="file"
        onChange={handleFileUpload}
        disabled={isLoading || !userAddress} // Disable if not connected
        style={{
          display: "block",
          marginBottom: "1rem",
          cursor: isLoading || !userAddress ? "not-allowed" : "pointer",
        }}
      />

      {isLoading && (
        <progress
          value={uploadProgress}
          max="100"
          style={{ width: "100%", marginBottom: "1rem" }}
        ></progress>
      )}

      {statusMessage && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, wordBreak: "break-all" }}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
