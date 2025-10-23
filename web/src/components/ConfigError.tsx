// components/ConfigError.tsx

export const ConfigError = () => {
  return (
    <div className="relative flex-grow flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-red-300">
        🚨 Configuration Error
      </h2>
      <p className="text-lg">
        The contract address (
        <code className="bg-red-800/50 p-1 rounded">
          NEXT_PUBLIC_CONTRACT_ADDRESS
        </code>
        ) is not set in your environment variables.
      </p>
    </div>
  );
};
