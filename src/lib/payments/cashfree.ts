import "server-only";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function cashfreeHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": process.env.CASHFREE_APP_ID!,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
  };
}

interface CreateCashfreeOrderParams {
  orderId: string; // our internal order UUID, used as Cashfree order_id too
  amount: number; // in rupees (major unit) — Cashfree does NOT use paise
  currency: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
}

export async function createCashfreeOrder(params: CreateCashfreeOrderParams) {
  const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(),
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: params.currency,
      customer_details: {
        customer_id: params.customerId,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone ?? "9999999999",
      },
      order_meta: {
        return_url: params.returnUrl,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create Cashfree order");
  }
  return data as { order_id: string; payment_session_id: string };
}

/** Fetches order status directly from Cashfree — used as a fallback
 * reconciliation check in addition to the webhook. */
export async function fetchCashfreeOrderStatus(orderId: string) {
  const res = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
    headers: cashfreeHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to fetch order status");
  return data as { order_status: string };
}
