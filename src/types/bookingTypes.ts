export interface CustomerPayload {
  id: string;
  name?: string;
  phone?: string;
}

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

export interface FlatPayment {
  pk: string;
  sk: string;
  paymentId: string;
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
}

export interface PaymentHistoryResponse {
  success: boolean;
  count: number;
  payments: FlatPayment[];
}
