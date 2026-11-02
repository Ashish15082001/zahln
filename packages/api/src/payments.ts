import {
  PaymentDetailResponseSchema,
  PaymentPageResponseSchema,
  PaymentResponseSchema,
  type CreatePaymentRequest,
  type PaymentDetailResponse,
  type PaymentListRequest,
  type PaymentPageResponse,
} from "@zahln/domain/payment/backend";
import {
  toCashierPaymentPage,
  toFinancePaymentDetail,
  toFinancePaymentPage,
  toPayment,
  toPaymentDetail,
  toPaymentPage,
  type CashierPaymentPage,
  type FinancePaymentDetail,
  type FinancePaymentPage,
  type Payment,
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
    // passed as the query map as a whole. A filter left out stays out of the
    // URL.
    query: {
      limit: request.limit,
      cursor: request.cursor,
      mensaId: request.mensaId,
      tillId: request.tillId,
      status: request.status,
      from: request.from,
      to: request.to,
      needsAttention: request.needsAttention,
      q: request.q,
    },
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
 * GET /payments as finance: one page of every mensa's payments, newest first,
 * narrowed by the request's filters. Leave `cursor` out for the first page,
 * and send the same filters with every later one.
 */
export const getFinancePayments = async (
  http: Http,
  request: PaymentListRequest,
  signal?: AbortSignal,
): Promise<FinancePaymentPage> =>
  toFinancePaymentPage(await requestPaymentPage(http, request, signal));

/** GET /payments/{paymentId}: one payment with its refunds and history. */
const requestPaymentDetail = (
  http: Http,
  paymentId: string,
  signal?: AbortSignal,
): Promise<PaymentDetailResponse> =>
  http.request({
    method: "GET",
    // Escaped, so an odd character in the id can't reach another path.
    path: `/payments/${encodeURIComponent(paymentId)}`,
    schema: PaymentDetailResponseSchema,
    authenticated: true,
    signal,
  });

/**
 * GET /payments/{paymentId} as a payer: one of their payments with its
 * refunds and history. Another payer's payment is `404 not_found`, the same
 * as one that doesn't exist.
 */
export const getPayment = async (
  http: Http,
  paymentId: string,
  signal?: AbortSignal,
): Promise<PaymentDetail> =>
  toPaymentDetail(await requestPaymentDetail(http, paymentId, signal));

/**
 * GET /payments/{paymentId} as finance: any mensa's payment, with who paid,
 * where, why it needs attention, its refunds and its history. A missing one
 * is `404 not_found`.
 */
export const getFinancePayment = async (
  http: Http,
  paymentId: string,
  signal?: AbortSignal,
): Promise<FinancePaymentDetail> =>
  toFinancePaymentDetail(await requestPaymentDetail(http, paymentId, signal));

/**
 * POST /orders/{orderId}/payments: pays the order as the logged-in payer, at
 * the amount they were shown. The key goes with every attempt, so a retry
 * after a lost reply gets back the same payment instead of paying twice. The
 * payment usually starts `pending` while the server checks it.
 *
 * No signal: once sent, a payment may be saved whatever the screen does, so
 * the caller can't call it off half-way.
 */
export const payOrder = async (
  http: Http,
  orderId: string,
  request: CreatePaymentRequest,
  idempotencyKey: string,
): Promise<Payment> => {
  const response = await http.request({
    method: "POST",
    path: `/orders/${encodeURIComponent(orderId)}/payments`,
    body: request,
    schema: PaymentResponseSchema,
    idempotencyKey,
    authenticated: true,
  });
  return toPayment(response);
};
