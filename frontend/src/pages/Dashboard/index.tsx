import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyH2 } from "@/components/ui/typographyH2";
import { useActivitiesSync } from "@/hooks/useActivitiesSync";

export default function Dashboard() {
  const { isSyncing, progress, startSync } = useActivitiesSync();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TypographyH1 className="text-3xl font-bold mb-2">
          Tableau de bord
        </TypographyH1>
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        disabled={isSyncing}
        onClick={startSync}
      >
        Démarrer la synchronisation
      </button>

      <TypographyH2>isSyncing: {isSyncing ? "Oui" : "Non"}</TypographyH2>
      <TypographyH2>Progress:</TypographyH2>
      <ul className="list-disc list-inside">
        {progress.map((item, index) => (
          <li className={`text-${item.type}`} key={index}>
            {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
