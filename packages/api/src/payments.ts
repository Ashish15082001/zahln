import {
  PaymentPageResponseSchema,
  type PaymentListRequest,
} from "@zahln/domain/payment/backend";
import {
  toPaymentPage,
  type PaymentPage,
} from "@zahln/domain/payment/frontend";
import type { Http } from "./http";

/**
 * GET /payments: one page of payments, newest first. Which ones depends on who
 * is logged in: a payer gets their own, a cashier their till's, finance all.
 * Leave `cursor` out for the first page.
 */
export const getPayments = async (
  http: Http,
  request: PaymentListRequest,
  signal?: AbortSignal,
): Promise<PaymentPage> => {
  const response = await http.request({
    method: "GET",
    path: "/payments",
    // Listed one by one: an interface has no index signature, so it can't be
    // passed as the query map as a whole.
    query: { limit: request.limit, cursor: request.cursor },
    schema: PaymentPageResponseSchema,
    authenticated: true,
    signal,
  });
  return toPaymentPage(response);
};
