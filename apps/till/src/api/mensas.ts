import { MensaListResponseSchema } from "@zahln/domain/mensa/backend";
import type { Mensa } from "@zahln/domain/mensa/frontend";
import type { Http } from "@zahln/api/http";

/**
 * GET /mensas: every mensa with its tills and menu. The till shows only the
 * cashier's own, so the caller picks it out of the list.
 */
export const getMensas = async (
  http: Http,
  signal?: AbortSignal,
): Promise<Mensa[]> => {
  const response = await http.request({
    method: "GET",
    path: "/mensas",
    schema: MensaListResponseSchema,
    authenticated: true,
    signal,
  });
  return response.items;
};
