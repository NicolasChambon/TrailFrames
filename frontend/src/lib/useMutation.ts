import axios from "axios";
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
      let errorMessage = "Unknown error";

      if (axios.isAxiosError<{ error?: string }>(error)) {
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}
