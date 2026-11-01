import {
  PaymentDetailResponseSchema,
  PaymentPageResponseSchema,
  type PaymentListRequest,
  type PaymentPageResponse,
} from "@zahln/domain/payment/backend";
import {
  toCashierPaymentPage,
  toPaymentDetail,
  toPaymentPage,
  type CashierPaymentPage,
  type PaymentDetail,
  type PaymentPage,
} from "@zahln/domain/payment/frontend";
import type { Http } from "./http";

/**
 * GET /payments: one page, newest first. Which payments depends on who is
 * logged in: a payer gets their own, a cashier their till's, finance all.
 */
const requestPaymentPage = (
  http: Http,
  request: PaymentListRequest,
  signal?: AbortSignal,
): Promise<PaymentPageResponse> =>
  http.request({
    method: "GET",
    path: "/payments",
    // Listed one by one: an interface has no index signature, so it can't be
    // passed as the query map as a whole.
    query: { limit: request.limit, cursor: request.cursor },
    schema: PaymentPageResponseSchema,
    authenticated: true,
    signal,
  });

/**
 * GET /payments as a payer: one page of their own payments, newest first.
 * Leave `cursor` out for the first page.
 */
export const getPayments = async (
  http: Http,
  request: PaymentListRequest,
  signal?: AbortSignal,
): Promise<PaymentPage> =>
  toPaymentPage(await requestPaymentPage(http, request, signal));

/**
 * GET /payments as a cashier: one page of their till's payments, newest
 * first, with who paid each. Leave `cursor` out for the first page.
 */
export const getCashierPayments = async (
  http: Http,
  request: PaymentListRequest,
  signal?: AbortSignal,
): Promise<CashierPaymentPage> =>
  toCashierPaymentPage(await requestPaymentPage(http, request, signal));

/**
 * GET /payments/{paymentId}: one payment with its refunds and history. Another
 * payer's payment is `404 not_found`, the same as one that doesn't exist.
 */
export const getPayment = async (
  http: Http,
  paymentId: string,
  signal?: AbortSignal,
): Promise<PaymentDetail> => {
  const response = await http.request({
    method: "GET",
    path: `/payments/${encodeURIComponent(paymentId)}`,
    schema: PaymentDetailResponseSchema,
    authenticated: true,
    signal,
  });
  return toPaymentDetail(response);
};
