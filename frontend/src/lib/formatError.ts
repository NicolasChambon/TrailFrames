export function formatError(error: string | null): string | null {
  if (!error) return null;

  if (error === "Network Error") {
    return "Impossible de se connecter au serveur.";
  }

  if (error.includes("Invalid email address")) {
    return "Adresse email invalide.";
  }

  return error;
}
