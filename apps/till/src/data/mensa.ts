import { useQuery } from "@tanstack/react-query";
import { getMensas } from "../api/mensas";
import { http, useTillSession } from "./session";

/**
 * The signed-in cashier's mensa, with its tills and menu. The data is null
 * when the server's list doesn't have it.
 */
export const useMensa = () => {
  const tillSession = useTillSession();
  const mensaId =
    tillSession.status === "signedIn" ? tillSession.cashier.mensaId : null;

  return useQuery({
    // Every till gets the same list, so the key doesn't name the mensa.
    queryKey: ["mensas"],
    queryFn: ({ signal }) => getMensas(http, signal),
    select: (mensas) => mensas.find((mensa) => mensa.id === mensaId) ?? null,
    enabled: mensaId !== null,
    // The menu doesn't change during a shift. logOut clears it, so each login
    // fetches it once.
    staleTime: Infinity,
  });
};
