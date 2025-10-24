// app/documents/[index]/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import {
  Loader2,
  AlertTriangle,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react"; // Imported Copy and ExternalLink icons

// Define the expected structure of file info from Lighthouse
interface LighthouseFileInfo {
  cid: string;
  fileName: string;
  fileSizeInBytes: string;
  mimeType: string;
  // Add other properties if needed
}

// =========================================================================
// NEW/IMPROVED HELPER COMPONENTS
// =========================================================================

// Copy to Clipboard Button
const CopyToClipboardButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Could not copy text: ", err));
  };

  return (
    <button
      onClick={handleCopy}
      className={`ml-3 p-1 rounded-full text-xs transition-colors duration-200 ${
        copied
          ? "bg-green-600/50 text-green-300 hover:bg-green-600/70"
          : "bg-gray-600/50 text-gray-300 hover:bg-cyan-500/50"
      }`}
      title={copied ? "Copied!" : "Copy CID"}
    >
      <Copy className="w-4 h-4" />
    </button>
  );
};

// Simple helper component for consistent styling
const DetailItem = ({
  label,
  value,
  isCid = false,
}: {
  label: string;
  value: string;
  isCid?: boolean;
}) => {
  const formattedValue = isCid ? (
    <div className="flex items-center">
      <span className="text-sm font-mono text-cyan-400 break-all">{value}</span>
      <CopyToClipboardButton content={value} />
    </div>
  ) : (
    <span className="text-white text-sm break-all text-right">{value}</span>
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-800 rounded-lg border border-gray-700/50">
      <span className="text-gray-300 font-medium mb-1 sm:mb-0">{label}:</span>
      {formattedValue}
    </div>
  );
};

// Helper function for size conversion
const formatBytes = (bytes: string) => {
  const numBytes = Number(bytes);
  if (numBytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================

export default function DocumentDetailsPage({
  params,
}: {
  params: { index: string };
}) {
  const searchParams = useSearchParams();
  const cid = searchParams.get("cid");
  const docIndex = params.index;

  const [fileInfo, setFileInfo] = useState<LighthouseFileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) {
      setError("CID not found in URL parameters.");
      setIsLoading(false);
      return;
    }

    const fetchFileInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // NOTE: Lighthouse SDK does not require an API key for getFileInfo
        const response = await lighthouse.getFileInfo(cid);
        setFileInfo(response.data);
      } catch (err) {
        console.error("Error fetching file info from Lighthouse:", err);
        setError(
          "Failed to fetch file details from Lighthouse. It may be a private file or the CID is invalid.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [cid]);

  const ipfsGatewayUrl = cid ? `https://ipfs.io/ipfs/${cid}` : "#";

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-10 bg-red-900/30 rounded-xl border border-red-700/50 text-center text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Data Error</h2>
        <p>{error}</p>
        <p className="text-sm mt-2 text-red-300">Document Index: #{docIndex}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-10 bg-gray-800/50 rounded-xl border border-gray-700/50 text-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
        <p className="text-lg font-medium">Loading document metadata...</p>
        <p className="text-sm mt-1">
          Fetching details from Lighthouse network.
        </p>
      </div>
    );
  }

  if (!fileInfo) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-10 bg-yellow-900/30 rounded-xl border border-yellow-700/50 text-center text-yellow-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
        <p className="text-lg font-medium">
          Details for Document #{docIndex} could not be found.
        </p>
        <p className="text-sm mt-2">
          Check the document index or CID for issues.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto mt-10">
      <div className="bg-gray-800/80 rounded-xl p-6 sm:p-10 shadow-2xl border border-gray-700/50">
        <div className="flex items-center mb-6 border-b border-gray-700 pb-4">
          <FileText className="w-8 h-8 text-cyan-400 mr-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            Document Metadata
          </h1>
          <span className="ml-4 px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm font-mono">
            #{docIndex}
          </span>
        </div>

        <div className="space-y-4">
          {/* Main Details */}
          <DetailItem
            label="IPFS Content ID (CID)"
            value={fileInfo.cid}
            isCid={true}
          />
          <DetailItem label="File Name" value={fileInfo.fileName} />
          <DetailItem label="File Type" value={fileInfo.mimeType} />
          <DetailItem
            label="File Size"
            value={formatBytes(fileInfo.fileSizeInBytes)}
          />

          {/* Action/Link Section */}
          <a
            href={ipfsGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full mt-6 p-4 rounded-lg bg-cyan-600/70 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            View File on IPFS Gateway
          </a>
        </div>
      </div>
    </div>
  );
}
