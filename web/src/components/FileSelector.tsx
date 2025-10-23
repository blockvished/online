// components/FileSelector.tsx
import { UploadCloud, FileIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils/upload";

interface FileSelectorProps {
  file: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileSelector = ({ file, onFileSelect }: FileSelectorProps) => {
  return (
    <label
      htmlFor="file"
      className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-white/5 transition-colors duration-300"
    >
      <input id="file" type="file" className="hidden" onChange={onFileSelect} />
      {file ? (
        <div className="flex flex-col items-center space-y-2 text-center">
          <FileIcon className="w-8 h-8 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">{file.name}</span>
          <span className="text-xs text-gray-400">
            {formatFileSize(file.size)} MB
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <UploadCloud className="w-8 h-8 text-gray-500" />
          <span className="text-sm font-medium">Click to choose a file</span>
          <span className="text-xs">(max 100MB recommended)</span>
        </div>
      )}
    </label>
  );
};
