import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TypographyP } from "@/components/ui/typographyP";
import api from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import { useAuthStore } from "@/stores/authStore";

interface SyncActivitiesResponse {
  success: boolean;
}

// TODO: plan to implement a header with a logout button
export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Redirect if user isn't already connected to Strava
  useEffect(() => {
    if (user && !user.stravaAthleteId) {
      navigate("/strava-sync", { replace: true });
    }
  }, [user, navigate]);

  const {
    mutate: fetchActivities,
    isLoading,
    error,
    data,
  } = useMutation<SyncActivitiesResponse>(() => api.put(`/activities`));

  const handleFetchActivities = async () => {
    // if (!trailFramesUserId) return;
    await fetchActivities();
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="text-2xl font-bold">Your Strava Activities</h2>

      <Button
        // disabled={isLoading || !trailFramesUserId}
        onClick={handleFetchActivities}
      >
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Fetching...
          </>
        ) : (
          "Fetch Activities"
        )}
      </Button>

      {error && <TypographyP className="text-red-500">{error}</TypographyP>}
      {data && (
        <TypographyP className="text-green-500">
          Activities fetched successfully!
        </TypographyP>
      )}
    </div>
  );
}
