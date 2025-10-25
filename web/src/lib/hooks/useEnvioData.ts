// hooks/useEnvioData.ts

import { useState, useEffect, useCallback } from "react";
import { fetchAllEnvioData, EnvioData } from "@/lib/envioFetch";

const REFRESH_INTERVAL_MS = 20000; // 15 seconds

/**
 * Custom hook to fetch Envio data and refresh it at a set interval.
 * @returns An object containing the data, loading state, and an error state.
 */
export function useEnvioData() {
  const [data, setData] = useState<EnvioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to perform the actual fetch
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const fetchedData = await fetchAllEnvioData();
      // console.log(fetchedData);
      setData(fetchedData);
    } catch (err) {
      setError("Failed to fetch data from Envio endpoint.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to perform the initial fetch and set up the interval
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up the refresh interval
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return { data, isLoading, error };
}
