// components/DocumentDisplay.tsx
import { Address } from "viem";
import Link from "next/link";
import { useDocument } from "@/lib/hooks/useContractData";

interface DocumentDisplayProps {
  userAddress: Address;
  index: number;
  isEnabled: boolean;
}

export const DocumentDisplay = ({
  userAddress,
  index,
  isEnabled,
}: DocumentDisplayProps) => {
  const { data: document, isLoading: isDocumentLoading } = useDocument(
    userAddress,
    index,
  );

  if (!isEnabled) return null;

  if (isDocumentLoading) {
    return <p className="text-gray-500 p-4">Loading Document #{index}...</p>;
  }

  if (document) {
    const docData = document as {
      owner: Address;
      cid: string;
      unlockTime: bigint;
      price: bigint;
      recipients: Address[];
      encrypted: boolean;
    };

    return (
      <div className="p-4 border-b border-gray-700 last:border-b-0">
        <h3 className="text-lg font-semibold text-cyan-400">
          Document #{index}
        </h3>
        <p className="text-sm mt-2">
          <span className="font-medium">CID (IPFS Hash):</span>{" "}
          <code className="bg-gray-700 p-0.5 rounded text-xs text-white break-all">
            {docData.cid}
          </code>
        </p>
        <p className="text-sm mt-1">
          <span className="font-medium">Encrypted:</span>{" "}
          {docData.encrypted ? "✅ Yes" : "❌ No"}
        </p>
        <Link
          href={`/documents/${index}?cid=${docData.cid}`}
          className="text-purple-400 hover:text-purple-300 text-sm mt-2 block"
        >
          View Details &rarr;
        </Link>
      </div>
    );
  }

  return <p className="text-red-400 p-4">Could not load Document #{index}.</p>;
};

interface DocumentListProps {
  userAddress: Address | undefined;
  documentCount: number;
  isDataReady: boolean;
}

export const DocumentList = ({
  userAddress,
  documentCount,
  isDataReady,
}: DocumentListProps) => {
  const documentIndices = Array.from(
    { length: documentCount },
    (_, i) => i + 1,
  );

  return (
    <div className="mt-6 p-4 bg-gray-900 rounded-xl max-h-96 overflow-y-auto border border-gray-700">
      {isDataReady && documentCount > 0 ? (
        documentIndices.map((index) => (
          <DocumentDisplay
            key={index}
            userAddress={userAddress as Address}
            index={index}
            isEnabled={isDataReady}
          />
        ))
      ) : isDataReady && documentCount === 0 ? (
        <p className="text-gray-400 text-center py-4">
          No documents uploaded yet.
        </p>
      ) : (
        <p className="text-gray-500 text-center py-4 animate-pulse">
          Loading documents...
        </p>
      )}
    </div>
  );
};
