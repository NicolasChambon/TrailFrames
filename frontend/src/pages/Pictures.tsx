import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";

export default function Pictures() {
  const userId = localStorage.getItem("userId");

  const { data, error, isLoading } = useSWR(
    `/activities/list/${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  console.log({ data, error, isLoading });

  return (
    <h2>
      <Button>Fetch Activities</Button>
    </h2>
  );
}
