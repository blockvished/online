// app/documents/[index]/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import { Loader2 } from "lucide-react"; // Assuming you use lucide-react for icons

// Define the expected structure of file info from Lighthouse
interface LighthouseFileInfo {
  cid: string;
  fileName: string;
  fileSizeInBytes: string;
  mimeType: string;
  // Add other properties if needed
}

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
        console.log(`Fetching Lighthouse file info for CID: ${cid}`);

        /* The core logic to fetch file info from Lighthouse
          using the CID passed in the URL.
        */
        const response = await lighthouse.getFileInfo(cid);
        console.log(response.data);

        setFileInfo(response.data);
      } catch (err) {
        console.error("Error fetching file info from Lighthouse:", err);
        setError("Failed to fetch file details from Lighthouse.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [cid]);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading document details...</p>
      </div>
    );
  }

  if (!fileInfo) {
    return (
      <div className="p-8 text-center text-yellow-400">
        <p>Details for Document #{docIndex} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-800/80 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
        Document Details (Index: #{docIndex})
      </h1>
      <div className="space-y-4">
        <DetailItem label="CID (IPFS Hash)" value={fileInfo.cid} />
        <DetailItem label="File Name" value={fileInfo.fileName} />
        <DetailItem label="File Type" value={fileInfo.mimeType} />
        <DetailItem
          label="File Size"
          value={`${(Number(fileInfo.fileSizeInBytes) / (1024 * 1024)).toFixed(2)} MB`}
        />
        {/* Display other fileInfo properties here */}
      </div>
    </div>
  );
}

// Simple helper component for consistent styling
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-center">
    <span className="text-gray-300 font-medium">{label}:</span>
    <span className="text-white break-all text-right">{value}</span>
  </div>
);
