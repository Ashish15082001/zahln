import { parseBerlinDay } from "@zahln/domain/day/berlinDay";
import { PaymentStatusSchema } from "@zahln/domain/payment/frontend";
import type { PaymentFilters } from "../../../data/payments";

// The filters live in the URL, so a reload, Back from a payment and a shared
// link all show the same payments. Short names, since finance reads and
// shares these links.
const filterParamNames = {
  query: "q",
  mensaId: "mensa",
  tillId: "till",
  status: "status",
  fromDay: "from",
  toDay: "to",
} satisfies Record<keyof PaymentFilters, string>;

const filterKeys = Object.keys(filterParamNames) as (keyof PaymentFilters)[];

// The server takes a search of up to 100 characters.
const MAX_QUERY_LENGTH = 100;

export const NO_PAYMENT_FILTERS: PaymentFilters = {
  fromDay: null,
  mensaId: null,
  query: null,
  status: null,
  tillId: null,
  toDay: null,
};

/** The text of a parameter, or null when it is missing or blank. */
const readText = (
  searchParams: URLSearchParams,
  name: string,
): string | null => {
  const text = searchParams.get(name)?.trim() ?? "";
  return text === "" ? null : text;
};

/**
 * The filters in the URL. One that isn't valid, e.g. typed by hand, counts as
 * not set rather than showing an error.
 */
export const readPaymentFilters = (
  searchParams: URLSearchParams,
): PaymentFilters => {
  const statusResult = PaymentStatusSchema.safeParse(
    searchParams.get(filterParamNames.status),
  );
  const fromDay = parseBerlinDay(searchParams.get(filterParamNames.fromDay));
  const toDay = parseBerlinDay(searchParams.get(filterParamNames.toDay));
  // A range written backwards still means the days between. Day strings
  // compare like the days they name.
  const isBackwards = fromDay !== null && toDay !== null && fromDay > toDay;

  return {
    fromDay: isBackwards ? toDay : fromDay,
    mensaId: readText(searchParams, filterParamNames.mensaId),
    query:
      readText(searchParams, filterParamNames.query)?.slice(
        0,
        MAX_QUERY_LENGTH,
      ) ?? null,
    status: statusResult.success ? statusResult.data : null,
    tillId: readText(searchParams, filterParamNames.tillId),
    toDay: isBackwards ? fromDay : toDay,
  };
};

/** The filters for the URL, leaving out the ones that aren't set. */
export const toPaymentSearchParams = (
  filters: PaymentFilters,
): Record<string, string> => {
  const searchParams: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = filters[key];
    if (value !== null) searchParams[filterParamNames[key]] = value;
  }
  return searchParams;
};

/** True when any filter is set, so there is something to clear. */
export const hasPaymentFilters = (filters: PaymentFilters): boolean =>
  filterKeys.some((key) => filters[key] !== null);
