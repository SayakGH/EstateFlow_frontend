/* ================= CUSTOMER TYPES ================= */

export interface CustomerPayload {
  id: string;
  name?: string;
  phone?: string;
}

/* ================= BOOK FLAT TYPES ================= */

export interface BookFlatPayload {
  customer: CustomerPayload;
  amount: number;
  totalPayment: number;
  summary: {
    mode:
      | "Bank Transfer"
      | "Cheque"
      | "UPI"
      | "Cash"
      | "Demand Draft"
      | "Others";
    chequeNumber: string | null;
    bankName: string | null;
  };
}

export interface BookFlatResponse {
  success: boolean;
  message: string;
}

/* ================= BOOKED FLAT ================= */

export interface BookedFlat {
  projectId: string;
  flatId: string;
  customer_id: string;
  customer_name: string;
  totalPayment: number;
  paid: number;
}

export interface GetBookedFlatResponse {
  success: boolean;
  booked: BookedFlat;
}

/* ================= ADD PAYMENT TYPES ================= */

export interface AddPaymentPayload {
  amount: number;
  summary: {
    mode:
      | "Bank Transfer"
      | "Cheque"
      | "UPI"
      | "Cash"
      | "Demand Draft"
      | "Others";
    chequeNumber: string | null;
    bankName: string | null;
  };
}

export interface AddPaymentResponse {
  success: boolean;
  message: string;
  paid: number;
}

/* ================= PAYMENT OBJECT ================= */

export interface FlatPayment {
  projectName: string;
  projectId: string;

  paymentId: string;
  flatId: string;

  customer: {
    id: string;
    name: string;
  };

  amount: number;

  summary: {
    mode:
      | "Bank Transfer"
      | "Cheque"
      | "UPI"
      | "Cash"
      | "Demand Draft"
      | "Others";
    chequeNumber: string | null;
    bankName: string | null;
  };

  createdAt: string; // ISO date string
}

/* ================= PAYMENT HISTORY RESPONSE ================= */

export interface PaymentHistoryResponse {
  success: boolean;
  count: number;
  payments: FlatPayment[];
}

/* ================= GET ALL PAYMENTS RESPONSE (PAGINATED) ================= */

export interface IGetAllPaymentsResponse {
  success: boolean;

  payments: FlatPayment[];

  totalCount: number;   // ✅ total payments in DB
  totalPages: number;   // ✅ total pages based on LIMIT
  currentPage: number;  // ✅ current page number

  count?: number; // ✅ optional (payments returned in this page)
}
