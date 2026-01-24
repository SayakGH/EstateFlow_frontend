import api from "./axios";
import type {
  BookFlatPayload,
  BookFlatResponse,
  GetBookedFlatResponse,
  AddPaymentPayload,
  AddPaymentResponse,
  PaymentHistoryResponse,
  IGetAllPaymentsResponse,
} from "@/types/bookingTypes";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= BOOKINGS ================= */

// Book Flat (free → booked)
export const bookFlat = async (
  projectId: string,
  flatId: string,
  payload: BookFlatPayload
) => {
  const res = await api.post<BookFlatResponse>(
    `bookings/flats/${projectId}/${flatId}/book`,
    payload,
    { headers: authHeader() }
  );

  return res.data;
};

// Get Booked Flat Details
export const getBookedFlat = async (projectId: string, flatId: string) => {
  const res = await api.get<GetBookedFlatResponse>(
    `bookings/flats/${projectId}/${flatId}/booked`,
    { headers: authHeader() }
  );

  return res.data;
};

// Add Payment (booked → sold when complete)
export const addPayment = async (
  projectId: string,
  flatId: string,
  payload: AddPaymentPayload
) => {
  const res = await api.post<AddPaymentResponse>(
    `payments/flats/${projectId}/${flatId}/pay`,
    payload,
    { headers: authHeader() }
  );

  return res.data;
};

// Get Payment History for Flat
export const getFlatPaymentHistory = async (
  projectId: string,
  flatId: string
) => {
  const res = await api.get<PaymentHistoryResponse>(
    `/payments/${projectId}/${flatId}/history`,
    { headers: authHeader() }
  );

  return res.data;
};

/* ================= ALL PAYMENTS (PAGINATED) ================= */

/**
 * Fetch ALL payments (Admin Dashboard)
 * Backend controls LIMIT
 * Supports pagination using ?page=
 */
export const getAllPayments = async (page = 1) => {
  const res = await api.get<IGetAllPaymentsResponse>(`/payments/all`, {
    headers: authHeader(),
    params: { page }, // ✅ pagination support
  });

  return res.data;
};

/* ================= SEARCH PAYMENTS (PAGINATED) ================= */

/**
 * Search payments by:
 * - paymentId
 * - customer name
 * - project name/id
 * - flatId
 *
 * Backend route:
 * GET /payments/search?q=...&page=...
 */
export const searchPayments = async (query: string, page = 1) => {
  const res = await api.get<IGetAllPaymentsResponse>(`/payments/search`, {
    headers: authHeader(),
    params: {
      q: query, // ✅ search keyword
      page,     // ✅ pagination support
    },
  });

  return res.data;
};
