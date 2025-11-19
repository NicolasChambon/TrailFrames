import { useState } from "react";

export function useMutation<T = void>(mutationFn: () => Promise<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn();
      setData(result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}
