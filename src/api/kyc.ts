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
    {
      headers: authHeader(),
    }
  );

  return res.data;
};

export const submitKyc = async (payload: KycPayload) => {
  const res = await api.post<KycResponse>("/customer-kyc/kyc", payload, {
    headers: authHeader(),
  });

  return res.data;
};

/* ================= FETCH CUSTOMERS ================= */

/** Fetch ALL customers (approved + pending) */
export const getAllCustomers = async () => {
  const res = await api.get<IGetCustomersResponse>("/customer-kyc/", {
    headers: authHeader(),
  });

  return res.data;
};

/** Fetch ONLY APPROVED customers */
export const getApprovedCustomers = async () => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/approved",
    {
      headers: authHeader(),
    }
  );

  return res.data;
};

/** Fetch ONLY PENDING customers */
export const getPendingCustomers = async () => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/pending",
    {
      headers: authHeader(),
    }
  );

  return res.data;
};

/* ================= ACTIONS ================= */

export const approveKyc = async (customerId: string) => {
  const res = await api.put<KycResponse>(
    `/customer-kyc/approve/${customerId}`,
    {},
    {
      headers: authHeader(),
    }
  );

  return res.data;
};

export const deleteKyc = async (customerId: string) => {
  const res = await api.delete<KycResponse>(
    `/customer-kyc/delete/${customerId}`,
    {
      headers: authHeader(),
    }
  );

  return res.data;
};
