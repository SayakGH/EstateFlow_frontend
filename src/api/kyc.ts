import api from "./axios";
import type {
  PresignKycResponse,
  KycPayload,
  KycResponse,
  IGetCustomersResponse,
} from "@/types/kycTypes";

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= KYC UPLOAD ================= */

export const getPresignedUrls = async (payload: {
  aadhaarType: string;
  panType: string;
  voterType?: string;
  otherType?: string;
}) => {
  const res = await api.post<PresignKycResponse>(
    "/customer-kyc/kyc/presign",
    payload,
    { headers: authHeader() }
  );

  return res.data;
};

export const submitKyc = async (payload: KycPayload) => {
  const res = await api.post<KycResponse>("/customer-kyc/kyc", payload, {
    headers: authHeader(),
  });

  return res.data;
};

/* ================= FETCH CUSTOMERS (BACKEND PAGINATED + SEARCH) ================= */

/**
 * Fetch ALL customers
 * Backend controls limit + search
 */
export const getAllCustomers = async (
  page = 1,
  search?: string
) => {
  const res = await api.get<IGetCustomersResponse>("/customer-kyc/", {
    headers: authHeader(),
    params: {
      page,
      ...(search ? { search } : {}),
    },
  });

  return res.data;
};

/**
 * Fetch ONLY APPROVED customers
 * Backend controls limit + search
 */
export const getApprovedCustomers = async (
  page = 1,
  search?: string
) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/approved",
    {
      headers: authHeader(),
      params: {
        page,
        ...(search ? { search } : {}),
      },
    }
  );

  return res.data;
};

/**
 * Fetch ONLY PENDING customers
 * Backend controls limit + search
 */
export const getPendingCustomers = async (
  page = 1,
  search?: string
) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/pending",
    {
      headers: authHeader(),
      params: {
        page,
        ...(search ? { search } : {}),
      },
    }
  );

  return res.data;
};

/* ================= ACTIONS ================= */

export const approveKyc = async (customerId: string) => {
  const res = await api.put<KycResponse>(
    `/customer-kyc/approve/${customerId}`,
    {},
    { headers: authHeader() }
  );

  return res.data;
};

export const deleteKyc = async (customerId: string) => {
  const res = await api.delete<KycResponse>(
    `/customer-kyc/delete/${customerId}`,
    { headers: authHeader() }
  );

  return res.data;
};
