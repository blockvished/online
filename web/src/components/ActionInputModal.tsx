// components/ActionInputModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface ActionInputModalProps {
  action: "Share" | "Revoke";
  docName: string;
  cid: string;
  onClose: () => void;
}

export const ActionInputModal = ({
  action,
  docName,
  cid,
  onClose,
}: ActionInputModalProps) => {
  const [recipients, setRecipients] = useState("");

  const handleSubmit = () => {
    const addresses = recipients
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Console log the action and recipients as requested
    console.log(
      `${action} action triggered for document: ${docName} (CID: ${cid})`,
    );
    console.log(`Recipients/Revokees:`, addresses);

    // In a real app, you'd call a contract write function here (e.g., useContractWrite for shareDocument or revokeDocument)

    alert(
      `${action} functionality is currently console logging the action: ${action} to ${addresses.length} addresses.`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-700 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {action} Document: {docName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Enter comma-separated usernames or wallet addresses to{" "}
          {action.toLowerCase()}.
        </p>

        <input
          type="text"
          placeholder="user1, 0xabc..., user2"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!recipients.trim()}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Confirm {action}
        </button>
      </div>
    </div>
  );
};
