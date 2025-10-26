// const ENDPOINT = String(process.env.ENVIO_ENDPOINT) || "http://localhost:8080/v1/graphql";
const ENDPOINT = "https://indexer.dev.hyperindex.xyz/e6b1e5d/v1/graphql";

// Define the shape of the data we expect from the Envio indexer
export interface EnvioData {
  SealEncrypt_AccessRevoked: {
    id: string;
    user: string;
    cid: string;
    revokeuser: string;
    revokeAddr: string;
  }[];
  SealEncrypt_AdminAdded: { id: string; admin: string }[];
  SealEncrypt_AdminRemoved: { id: string; admin: string }[];
  SealEncrypt_DocumentAdded: {
    id: string;
    addedBy: string;
    cid: string;
    user: string;
  }[];
  SealEncrypt_ShareAccess: {
    id: string;
    user: string;
    cid: string;
    shareUser: string;
    shareAddr: string;
  }[];
  SealEncrypt_UsernameSetAndCreated: {
    id: string;
    user: string;
    username: string;
  }[];
  SealEncrypt_UsernameSetAndUpdated: {
    id: string;
    user: string;
    username: string;
  }[];
}

const ALL_DATA_QUERY = `
  query AllSealEncryptData {
    SealEncrypt_AccessRevoked {
      id
      user
      cid
      revokeuser
      revokeAddr
    }
    SealEncrypt_AdminAdded {
      id
      admin
    }
    SealEncrypt_AdminRemoved {
      id
      admin
    }
    SealEncrypt_DocumentAdded {
      id
      addedBy
      cid
      user
    }
    SealEncrypt_ShareAccess {
      id
      user
      cid
      shareUser
      shareAddr
    }
    SealEncrypt_UsernameSetAndCreated {
      id
      user
      username
    }
    SealEncrypt_UsernameSetAndUpdated {
      id
      user
      username
    }
  }
`;

/**
 * Fetches all indexed data from the Envio GraphQL endpoint.
 * @returns A promise that resolves to the EnvioData object or null on failure.
 */
export async function fetchAllEnvioData(): Promise<EnvioData | null> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Use the pre-defined GraphQL query string
      body: JSON.stringify({ query: ALL_DATA_QUERY }),
      cache: "no-store", // Crucial for live data in Next.js Server Components, though we use a client hook below
    });

    if (!response.ok) {
      console.error(
        `Envio fetch failed: HTTP ${response.status} - ${response.statusText}`,
      );
      return null;
    }

    const result = await response.json();

    // Optional: Check for GraphQL errors
    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    return result.data as EnvioData;
  } catch (error) {
    console.error("❌ Network or Parsing failed:", error);
    return null;
  }
}
