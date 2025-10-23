// components/UploadStatus.tsx
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface UploadStatusProps {
  loading: boolean;
  status: string;
  progress: number;
  error: string;
  cid: string;
}

export const UploadStatus = ({
  loading,
  status,
  progress,
  error,
  cid,
}: UploadStatusProps) => {
  return (
    <>
      {loading && (
        <div className="w-full">
          <p className="text-sm text-gray-400 text-center mb-2">{status}</p>
          <div className="w-full bg-white/10 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cid && !loading && !error && (
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Upload & Metadata successful!</span>
          </div>
          <p className="text-xs text-gray-400 break-all px-4">CID: {cid}</p>
          <a
            href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs font-semibold"
          >
            View on IPFS Gateway
          </a>
        </div>
      )}
    </>
  );
};
