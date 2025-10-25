// components/DocumentDisplay.tsx
import { Address } from "viem";
import Link from "next/link";
import { useDocument } from "@/lib/hooks/useContractData";
import { Share2, Lock, Unlock, Eye, Trash2, X, Copy } from "lucide-react"; // Imported Copy icon
import { DecryptButton } from "./DecryptButton";
import { useState } from "react";
import { motion } from "framer-motion";
import { ActionInputModal } from "./ActionInputModal";

// =========================================================================
// NEW COMPONENT: CopyToClipboardButton
// =========================================================================
interface CopyButtonProps {
  content: string;
  className?: string;
  title?: string;
  iconOnly?: boolean;
}

const CopyToClipboardButton = ({
  content,
  className = "",
  title = "Copy to Clipboard",
  iconOnly = false,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => console.error("Could not copy text: ", err));
  };

  const baseClasses =
    "flex items-center justify-center gap-2 transition-colors duration-200";
  const colorClasses = copied
    ? "bg-green-600/50 text-green-300 hover:bg-green-600/70"
    : "bg-gray-600/50 text-gray-300 hover:bg-gray-600/70";
  const paddingClasses = iconOnly ? "p-2 rounded-full" : "py-3 rounded-lg";

  return (
    <button
      onClick={handleCopy}
      className={`${baseClasses} ${colorClasses} ${paddingClasses} ${className}`}
      title={title}
      disabled={copied}
    >
      <Copy className="w-4 h-4" />
      {!iconOnly && (
        <span className="font-semibold text-sm">
          {copied ? "Copied!" : "Copy CID"}
        </span>
      )}
    </button>
  );
};

// =========================================================================
// EXISTING COMPONENTS (Rest of the file)
// =========================================================================

// ADDED: ViewMode type
type ViewMode = "list" | "grid";

interface DocumentDisplayProps {
  userAddress: Address;
  index: number;
  isEnabled: boolean;
  viewMode: ViewMode;
  // ADDED: New prop for grid mode click handler
  onGridClick: (
    index: number,
    cid: string,
    docName: string,
    encrypted: boolean,
    initialAction?: "Share" | "Revoke" | null,
  ) => void;
}

// Helper component for the content structure
const DocumentContent = ({ docData, index, viewMode }: any) => {
  // ... (Your existing Document Icon and Info rendering logic)
  const textContainerClasses =
    viewMode === "grid" ? "text-center" : "flex-1 min-w-0";
  const iconClasses = viewMode === "grid" ? "mx-auto" : "";

  return (
    <div
      className={
        viewMode === "list"
          ? "flex items-center gap-4 min-w-0"
          : "flex flex-col items-center gap-3"
      }
    >
      {/* Document Icon */}
      <div
        className={`w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${iconClasses}`}
      >
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Document Info */}
      <div className={textContainerClasses}>
        <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
          {docData.docName || `Document #${index}`}
        </h3>
        <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              docData.encrypted ? "text-green-400" : "text-gray-400"
            }`}
          >
            {docData.encrypted ? (
              <>
                <Lock className="w-3 h-3" /> Encrypted
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" /> Unencrypted
              </>
            )}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400">Doc #{index}</span>
        </div>
      </div>
    </div>
  );
};

export const DocumentDisplay = ({
  userAddress,
  index,
  isEnabled,
  viewMode,
  onGridClick,
}: DocumentDisplayProps) => {
  const { data: document, isLoading: isDocumentLoading } = useDocument(
    userAddress,
    index,
  );

  const baseClasses =
    "bg-gray-800/50 hover:bg-gray-800/70 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group";

  if (!isEnabled) return null;

  if (isDocumentLoading) {
    const skeletonClasses =
      viewMode === "list"
        ? "flex items-center gap-4"
        : "flex flex-col items-center gap-3";

    return (
      <div className={`${baseClasses} animate-pulse`}>
        <div className={skeletonClasses}>
          <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (document) {
    const docData = {
      ...document,
      sharedRecipient: document.sharedRecipients,
    } as {
      owner: Address;
      cid: string;
      unlockTime: bigint;
      price: bigint;
      sharedRecipient: readonly Address[];
      encrypted: boolean;
      docName: string;
    };

    const infoHref = `/documents/${index}?cid=${docData.cid}`;

    // --- GRID VIEW: Click opens modal/action menu ---
    if (viewMode === "grid") {
      return (
        <div
          className={`${baseClasses} cursor-pointer`}
          onClick={() =>
            onGridClick(index, docData.cid, docData.docName, docData.encrypted)
          }
        >
          <DocumentContent
            docData={docData}
            index={index}
            viewMode={viewMode}
          />
        </div>
      );
    }

    // --- LIST VIEW: Row with action buttons ---
    return (
      <div className={`${baseClasses} flex items-center justify-between`}>
        {/* Left Side: Document Info */}
        <DocumentContent docData={docData} index={index} viewMode={viewMode} />

        {/* Right Side: Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Decrypt Button (using the new component) */}
          {docData.encrypted && (
            <DecryptButton cid={docData.cid} docName={docData.docName} />
          )}

          {/* Copy CID Button (Icon Only) */}
          <CopyToClipboardButton
            content={docData.cid}
            iconOnly={true}
            title="Copy Document CID"
          />

          {/* Share Button (opens modal) */}
          <button
            onClick={() => {
              // Pass the initialAction to tell the modal what to immediately open
              onGridClick(
                index,
                docData.cid,
                docData.docName,
                docData.encrypted,
                "Share", // <--- Added Initial Action
              );
            }}
            className="flex items-center justify-center p-2 rounded-full bg-blue-600/50 text-blue-300 hover:bg-blue-600/70 transition-colors"
            title="Share Document"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Revoke Button (opens modal) */}
          <button
            onClick={() => {
              // Pass the initialAction to tell the modal what to immediately open
              onGridClick(
                index,
                docData.cid,
                docData.docName,
                docData.encrypted,
                "Revoke", // <--- Added Initial Action
              );
            }}
            className="flex items-center justify-center p-2 rounded-full bg-red-600/50 text-red-300 hover:bg-red-600/70 transition-colors"
            title="Revoke Access"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* View Info Button (Link) */}
          <Link
            href={infoHref}
            className="flex items-center justify-center p-2 rounded-full bg-gray-600/50 text-gray-300 hover:bg-gray-600/70 transition-colors"
            title="View Document Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {/* Arrow Icon is removed in list view since we have explicit buttons */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-900/20 rounded-xl p-6 border border-red-700/50">
      <p className="text-red-400 text-sm">Could not load Document #{index}.</p>
    </div>
  );
};

// Document List component - Needs a state for the active document/modal
interface DocumentListProps {
  userAddress: Address | undefined;
  documentCount: number;
  isDataReady: boolean;
  viewMode: ViewMode;
}

// NEW COMPONENT: Modal for Grid-Click Actions
interface GridActionModalProps {
  index: number;
  cid: string;
  docName: string;
  encrypted: boolean;
  onClose: () => void;
  // ADDED: Optional prop to immediately show an action input
  initialAction?: "Share" | "Revoke" | null;
}

const GridActionModal = ({
  index,
  cid,
  docName,
  encrypted,
  onClose,
  initialAction = null,
}: GridActionModalProps) => {
  // Use initialAction if provided, otherwise start with no action
  const [action, setAction] = useState<"Share" | "Revoke" | null>(
    initialAction,
  );

  const infoHref = `/documents/${index}?cid=${cid}`;

  if (action) {
    return (
      <ActionInputModal
        index={index}
        action={action}
        docName={docName}
        cid={cid}
        onClose={() => setAction(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-700 space-y-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white truncate">{docName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Decrypt Button */}
          {encrypted && (
            <DecryptButton
              cid={cid}
              docName={docName}
              className="col-span-2 !py-3"
            />
          )}

          {/* Share Button */}
          <button
            onClick={() => setAction("Share")}
            className="flex items-center justify-center gap-2 bg-blue-600/50 text-blue-300 font-semibold py-3 rounded-lg hover:bg-blue-600/70 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>

          {/* Revoke Button */}
          <button
            onClick={() => setAction("Revoke")}
            className="flex items-center justify-center gap-2 bg-red-600/50 text-red-300 font-semibold py-3 rounded-lg hover:bg-red-600/70 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" /> Revoke
          </button>

          {/* Copy CID Button (Full Width/Text) */}
          <CopyToClipboardButton
            content={cid}
            className="col-span-2"
            title="Copy Document CID"
            iconOnly={false}
          />

          {/* View Info Button (Link) */}
          <Link
            href={infoHref}
            onClick={onClose} // Close modal on navigation
            className="col-span-2 flex items-center justify-center gap-2 bg-gray-600/50 text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-600/70 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" /> View Info
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export const DocumentList = ({
  userAddress,
  documentCount,
  isDataReady,
  viewMode,
}: DocumentListProps) => {
  const documentIndices = Array.from(
    { length: documentCount },
    (_, i) => i + 1,
  );

  // ADDED: State for managing the modal in Grid view
  const [activeDocument, setActiveDocument] = useState<{
    index: number;
    cid: string;
    docName: string;
    encrypted: boolean;
    initialAction?: "Share" | "Revoke" | null; // <--- ADDED initialAction
  } | null>(null);

  const handleGridClick = (
    index: number,
    cid: string,
    docName: string,
    encrypted: boolean,
    initialAction: "Share" | "Revoke" | null = null, // <--- ACCEPT initialAction
  ) => {
    // This handler now sets the state which includes the initial action
    setActiveDocument({ index, cid, docName, encrypted, initialAction });
  };

  const documentListClasses =
    viewMode === "list"
      ? "space-y-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className="mt-6">
      {isDataReady && documentCount > 0 ? (
        <>
          <div
            className={`max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 ${documentListClasses}`}
          >
            {documentIndices.map((index) => (
              <DocumentDisplay
                key={index}
                userAddress={userAddress as Address}
                index={index}
                isEnabled={isDataReady}
                viewMode={viewMode}
                onGridClick={handleGridClick} // PASS CLICK HANDLER
              />
            ))}
          </div>

          {/* RENDER MODAL IF ACTIVE DOCUMENT IS SET, regardless of viewMode */}
          {activeDocument && (
            <GridActionModal
              {...activeDocument}
              onClose={() => setActiveDocument(null)}
            />
          )}
        </>
      ) : isDataReady && documentCount === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-12 border border-gray-700/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">
            No documents uploaded yet
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Upload your first encrypted document to get started
          </p>
        </div>
      ) : (
        <div className={documentListClasses}>
          {[1, 2, 3, 4].map((i) => {
            const skeletonListClasses = "flex items-center gap-4";
            const skeletonGridClasses = "flex flex-col items-center gap-3";
            const skeletonContentClasses =
              viewMode === "list" ? skeletonListClasses : skeletonGridClasses;

            return (
              <div
                key={i}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-pulse"
              >
                <div className={skeletonContentClasses}>
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
