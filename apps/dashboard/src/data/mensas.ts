import { useQuery } from "@tanstack/react-query";
import { getMensas } from "@zahln/api/mensas";
import { http } from "./session";

/**
 * Every mensa with its tills, for the payment filters. They don't change
 * during a morning's work; logOut clears them, so each login fetches them
 * once.
 */
export const useMensas = () =>
  useQuery({
    queryKey: ["mensas"],
    queryFn: ({ signal }) => getMensas(http, signal),
    staleTime: Infinity,
  });
