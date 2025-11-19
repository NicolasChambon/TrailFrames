import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TypographyP } from "@/components/ui/typographyP";
import api from "@/lib/api";
import { useMutation } from "@/lib/useMutation";

export default function Pictures() {
  const userId = localStorage.getItem("userId");

  const {
    mutate: fetchActivities,
    isLoading,
    error,
    data,
  } = useMutation(() => api.put(`/activities/${userId}`));

  const handleFetchActivities = async () => {
    if (!userId) return;
    await fetchActivities();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4">
      <h2 className="text-2xl font-bold">Your Strava Activities</h2>

      <Button disabled={isLoading || !userId} onClick={handleFetchActivities}>
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Fetching...
          </>
        ) : (
          "Fetch Activities"
        )}
      </Button>

      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <TypographyP className="text-green-500">
          Activities fetched successfully!
        </TypographyP>
      )}
    </div>
  );
}
