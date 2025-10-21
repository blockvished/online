"use client";

import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getSignedMessage, uploadEncryptedFile } from "@/lib/lighthouse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  XCircle,
  FileIcon,
} from "lucide-react";

export default function UploadPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setCid("");
    setStatus("");
    setError("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!isConnected || !userAddress || !walletClient) {
      setError("Please connect your wallet before uploading.");
      return;
    }

    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setStatus("Signing message...");
      setProgress(10);

      const signedMsg = await getSignedMessage(userAddress, walletClient);

      setStatus("Uploading encrypted file...");
      const cid = await uploadEncryptedFile(
        [file],
        userAddress,
        signedMsg,
        (progress) => {
          const percent = Math.round(
            (progress.uploaded / progress.total) * 100,
          );
          setProgress(percent);
          setStatus(`Uploading... ${percent}%`);
        },
      );

      setCid(cid);
      setStatus("Upload complete!");
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2 text-gray-800">
            <UploadCloud className="w-5 h-5 text-indigo-500" />
            Secure Encrypted Upload
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {!isConnected ? (
            <p className="text-center text-sm text-gray-500">
              Please connect your wallet to continue.
            </p>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <label
                htmlFor="file"
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition"
              >
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <FileIcon className="w-6 h-6 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-gray-500">
                    <UploadCloud className="w-6 h-6 text-indigo-400" />
                    <span className="text-sm font-medium">
                      Click to choose a file
                    </span>
                    <span className="text-xs text-gray-400">
                      (max 100MB recommended)
                    </span>
                  </div>
                )}
              </label>

              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Uploading...
                  </>
                ) : (
                  "Encrypt & Upload"
                )}
              </Button>

              {status && (
                <p className="text-sm text-gray-600 text-center">{status}</p>
              )}

              {loading && (
                <Progress value={progress} className="w-full h-2 bg-gray-200" />
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {cid && (
                <div className="mt-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Uploaded successfully!</span>
                  </div>
                  <p className="text-xs text-gray-500 break-all">CID: {cid}</p>
                  <a
                    href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                    target="_blank"
                    className="text-indigo-500 hover:underline text-xs"
                  >
                    View on IPFS
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
