// components/StatusBadge.tsx
interface StatusBadgeProps {
  isLoading: boolean;
  value: string | number | undefined;
  emptyMessage: string;
  colorClass: string;
}

export const StatusBadge = ({
  isLoading,
  value,
  emptyMessage,
  colorClass,
}: StatusBadgeProps) => {
  if (isLoading) {
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 animate-pulse">
        ⏳ Loading...
      </span>
    );
  }

  if (value && value !== "") {
    return (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-400">
      🚫 {emptyMessage}
    </span>
  );
};
