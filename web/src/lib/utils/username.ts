// lib/utils/username.ts

export interface UsernameValidation {
  isValid: boolean;
  error: string;
}

/**
 * Validates username according to rules:
 * - Minimum 3 characters
 * - Must start with a letter
 * - Only alphanumeric characters and underscores
 */
export const validateUsername = (username: string): UsernameValidation => {
  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (!/^[a-zA-Z]/.test(username)) {
    return { isValid: false, error: "Username must start with a letter" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { isValid: true, error: "" };
};

/**
 * Checks if an address is the zero address
 */
export const isZeroAddress = (address: string | undefined): boolean => {
  return address === "0x0000000000000000000000000000000000000000";
};

/**
 * Determines if a username is taken based on contract response
 */
export const isUsernameTaken = (
  addressCheck: string | undefined,
  isLoading: boolean,
): boolean => {
  return (
    !isLoading && addressCheck !== undefined && !isZeroAddress(addressCheck)
  );
};
