// lib/hooks/useContractData.ts
import { useAccount, useContractRead } from "wagmi";
import { Address } from "viem";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | Address
  | undefined;

/**
 * Hook to fetch user's username from the contract
 */
export const useUsername = () => {
  const { address, isConnected } = useAccount();

  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "usernames",
    args: [address as Address],
    query: {
      enabled: isConnected && !!CONTRACT_ADDRESS && !!address,
    },
  });
};

/**
 * Hook to check if a username is already taken
 */
export const useUsernameAvailability = (username: string) => {
  const { isConnected } = useAccount();

  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "usernameToAddress",
    args: [username],
    query: {
      enabled: isConnected && !!CONTRACT_ADDRESS && username.length > 0,
    },
  });
};

/**
 * Hook to fetch user's document count
 */
export const useDocumentCount = () => {
  const { address, isConnected } = useAccount();

  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "getDocumentCount",
    args: [address as Address],
    query: {
      enabled: isConnected && !!CONTRACT_ADDRESS && !!address,
    },
  });
};

/**
 * Hook to fetch a specific document by index
 */
export const useDocument = (
  userAddress: Address | undefined,
  index: number,
) => {
  const { isConnected } = useAccount();

  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: SEAL_ENCRYPT_ABI,
    functionName: "getDocument",
    args: [userAddress as Address, BigInt(index)],
    query: {
      enabled: isConnected && !!CONTRACT_ADDRESS && !!userAddress,
    },
  });
};

/**
 * Get the contract address
 */
export const getContractAddress = () => CONTRACT_ADDRESS;
