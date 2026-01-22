import api from "./axios";
import type {
  BookFlatPayload,
  BookFlatResponse,
  GetBookedFlatResponse,
  AddPaymentPayload,
  AddPaymentResponse,
  PaymentHistoryResponse,
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
  payload: BookFlatPayload,
) => {
  const res = await api.post<BookFlatResponse>(
    `bookings/flats/${projectId}/${flatId}/book`,
    payload,
    { headers: authHeader() },
  );

  return res.data;
};

// Get Booked Flat Details
export const getBookedFlat = async (projectId: string, flatId: string) => {
  const res = await api.get<GetBookedFlatResponse>(
    `bookings/flats/${projectId}/${flatId}/booked`,
    { headers: authHeader() },
  );

  return res.data;
};

// Add Payment (booked → sold when complete)
export const addPayment = async (
  projectId: string,
  flatId: string,
  payload: AddPaymentPayload,
) => {
  const res = await api.post<AddPaymentResponse>(
    `payments/flats/${projectId}/${flatId}/pay`,
    payload,
    { headers: authHeader() },
  );

  return res.data;
};

export const getFlatPaymentHistory = async (
  projectId: string,
  flatId: string,
) => {
  const res = await api.get<PaymentHistoryResponse>(
    `/payments/${projectId}/${flatId}/history`,
    { headers: authHeader() },
  );

  return res.data;
};
