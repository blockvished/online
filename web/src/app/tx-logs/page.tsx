// app/page.tsx (or components/EnvioDashboard.tsx)

"use client";

import { useEnvioData } from "@/lib/hooks/useEnvioData";
import {
  Loader2,
  AlertTriangle,
  Database,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useMemo } from "react";

// Helper component for copy-to-clipboard button
const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors inline-flex items-center justify-center"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-400" />
      ) : (
        <Copy className="w-3 h-3 text-gray-400 hover:text-cyan-400" />
      )}
    </button>
  );
};

// Helper component to render a single table of event data
// Helper component to render a single table of event data
const DataTable: React.FC<{ title: string; data: any[] }> = ({
  title,
  data,
}) => {
  // State to manage expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_ROWS_INITIAL = 5;

  // Determine a subtle accent color based on the title
  const getAccentColor = () => {
    if (title.includes("DocumentAdded")) return "border-l-cyan-500";
    if (title.includes("ShareAccess")) return "border-l-purple-500";
    if (title.includes("Revoked")) return "border-l-red-500";
    if (title.includes("Username")) return "border-l-green-500";
    if (title.includes("Admin")) return "border-l-yellow-500";
    return "border-l-gray-500";
  };

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700 ${getAccentColor()} border-l-4 h-full flex flex-col`}
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mt-auto">No events recorded yet.</p>
      </motion.div>
    );
  }

  // Use the keys of the first object to generate table headers, excluding 'id'
  const keys = Object.keys(data[0]).filter((key) => key.toLowerCase() !== "id");

  // Determine the data to display based on the expanded state
  const displayData = isExpanded ? data : data.slice(0, MAX_ROWS_INITIAL);
  const totalEvents = data.length;
  const isExpandable = totalEvents > MAX_ROWS_INITIAL;
  const hiddenCount = totalEvents - MAX_ROWS_INITIAL;

  // --- MODIFIED TRUNCATION LOGIC ---
  const truncate = (value: any, key: string) => {
    const str = String(value);
    const lowerKey = key.toLowerCase();

    // Custom Truncation for CID (first 4, last 4)
    if (lowerKey.includes("cid")) {
      if (str.length > 8) {
        return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
      }
      return str; // If less than 8 characters, don't truncate
    }

    // Custom Truncation for Addresses (first 3, last 4)
    const isAddress =
      lowerKey.includes("user") ||
      lowerKey.includes("admin") ||
      lowerKey.includes("address") ||
      lowerKey.includes("addr") ||
      lowerKey.includes("shareuser");

    if (isAddress) {
      if (str.length > 7) {
        return `${str.substring(0, 3)}...${str.substring(str.length - 4)}`;
      }
      return str; // If less than 7 characters, don't truncate
    }

    // Default truncation for other long fields (Original: first 8, then ...)
    return str.length > 20 ? `${str.substring(0, 8)}...` : str;
  };
  // ---------------------------------

  // Check if a field is copyable (CID or address-like fields)
  const isCopyableField = (key: string) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes("cid") ||
      lowerKey.includes("user") ||
      lowerKey.includes("admin") ||
      lowerKey.includes("address") ||
      lowerKey.includes("addr") || // Add this line to catch shareAddr, revokeAddr, etc.
      lowerKey.includes("shareuser")
    );
  };

  const AccentIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-[400px] bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl shadow-purple-900/10 border border-cyan-500/20 overflow-hidden ${getAccentColor()} border-l-4 flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          {title}
        </h3>
        <span className="text-sm font-mono text-gray-400 py-1 px-3 bg-gray-800 rounded-full">
          {totalEvents} Total
        </span>
      </div>

      {/* Table Container - Limited height when not expanded */}
      <div
        className={`overflow-x-auto flex-grow ${
          !isExpanded && isExpandable ? "max-h-[300px]" : ""
        }`}
      >
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800/70 sticky top-0 z-10">
            <tr>
              {keys.map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-800">
            {displayData.map((row, index) => (
              <motion.tr
                key={index}
                className="hover:bg-gray-800/60 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {keys.map((key) => (
                  <td
                    key={key}
                    className="px-6 py-3 whitespace-nowrap text-gray-300 font-mono text-xs"
                  >
                    <div className="flex items-center">
                      {/* CALLING TRUNCATE WITH THE KEY */}
                      {truncate(row[key], key)}
                      {isCopyableField(key) &&
                        row[key] &&
                        String(row[key]).trim() !== "" && (
                          <CopyButton value={String(row[key])} />
                        )}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expansion/Collapse Button */}
      {isExpandable && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-4 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            isExpanded
              ? "bg-gray-700 text-cyan-400 hover:bg-gray-600"
              : "bg-cyan-900/30 text-cyan-300 hover:bg-cyan-800/50"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AccentIcon className="w-4 h-4" />
          {isExpanded ? "Collapse View" : `Show All ${hiddenCount} More Events`}
        </motion.button>
      )}

      {/* Footer text for when it's not expandable or collapsed */}
      {!isExpandable && (
        <p className="text-xs text-gray-600 mt-4 text-center flex-shrink-0">
          Showing all {displayData.length} recorded events.
        </p>
      )}
    </motion.div>
  );
};

// Function to safely reverse and slice to get the last N elements (most recent)
const getRecentData = (data: any[], count: number = 20) => {
  if (!data) return [];
  return [...data].reverse().slice(0, count);
};

export default function EnvioDashboard() {
  const { data, isLoading, error } = useEnvioData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mr-3" />
        <p className="text-xl font-medium text-cyan-400">
          Loading Envio Data...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg bg-gray-900/70 backdrop-blur-md border border-red-600/50 rounded-2xl shadow-2xl shadow-red-900/50 p-8 text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Envio Connection Error
          </h1>
          <p className="text-gray-400">
            Could not connect to or fetch data from the Envio indexer endpoint
          </p>
          <p className="mt-4 text-red-300 text-sm font-mono break-words">
            Error details: {error || "No data received."}
          </p>
        </motion.div>
        {/* Error Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-900/30 via-red-900/10 to-transparent rounded-full blur-3xl" />
      </div>
    );
  }

  // Apply the recent data filter to all datasets
  const recentData = {
    DocumentAdded: getRecentData(data.SealEncrypt_DocumentAdded),
    ShareAccess: getRecentData(data.SealEncrypt_ShareAccess),
    AccessRevoked: getRecentData(data.SealEncrypt_AccessRevoked),
    UsernameCreated: getRecentData(data.SealEncrypt_UsernameSetAndCreated),
    UsernameUpdated: getRecentData(data.SealEncrypt_UsernameSetAndUpdated),
    AdminAdded: getRecentData(data.SealEncrypt_AdminAdded),
    AdminRemoved: getRecentData(data.SealEncrypt_AdminRemoved),
  };

  // --- Dashboard View ---
  return (
    <div className="min-h-screen p-8 bg-gray-900 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-900/30 via-purple-900/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />

      <header className="mb-10 pb-6 border-b border-gray-700/50 relative z-10">
        <div className="flex items-center gap-4">
          <Database className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            SealEncrypt Transaction Logs
          </h1>
        </div>
        <p className="text-gray-500 mt-2 text-lg">
          Real-time event data from the Envio indexer.
        </p>
        <p className="text-gray-600 text-sm">
          Showing 5 most recent transactions by default. Click 'Show All' to
          expand. Auto-refreshing every 15 seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 relative z-10">
        {/* Document Transaction Log (Grid Section) */}
        <section>
          <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2 border-b border-gray-800 pb-2 mb-6">
            <FileText className="w-6 h-6 text-yellow-400" /> Document
            Transaction Log
          </h2>
          {/* Main Document Events: 1 column on small, 3 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DataTable
              title="DocumentAdded Events"
              data={recentData.DocumentAdded}
            />
            <DataTable
              title="ShareAccess Events"
              data={recentData.ShareAccess}
            />
            <DataTable
              title="AccessRevoked Events"
              data={recentData.AccessRevoked}
            />
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* User & Admin Activity (Grid Section) */}
        <section>
          <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2 border-b border-gray-800 pb-2 mb-6">
            <Users className="w-6 h-6 text-purple-400" /> User & Admin Activity
          </h2>
          {/* User/Admin Events: 1 column on small, 2 columns on medium, 4 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <DataTable
              title="Username Created"
              data={recentData.UsernameCreated}
            />
            <DataTable
              title="Username Updated"
              data={recentData.UsernameUpdated}
            />
            <DataTable title="Admin Added" data={recentData.AdminAdded} />
            <DataTable title="Admin Removed" data={recentData.AdminRemoved} />
          </div>
        </section>
      </div>
    </div>
  );
}
