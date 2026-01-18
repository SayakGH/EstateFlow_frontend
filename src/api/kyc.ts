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

/* ================= LISTING (PAGINATION ONLY) ================= */

/** Fetch ALL customers */
export const getAllCustomers = async (page = 1) => {
  const res = await api.get<IGetCustomersResponse>("/customer-kyc/", {
    headers: authHeader(),
    params: { page },
  });

  return res.data;
};

/** Fetch ONLY APPROVED customers */
export const getApprovedCustomers = async (page = 1) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/approved",
    {
      headers: authHeader(),
      params: { page },
    }
  );

  return res.data;
};

/** Fetch ONLY PENDING customers */
export const getPendingCustomers = async (page = 1) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/pending",
    {
      headers: authHeader(),
      params: { page },
    }
  );

  return res.data;
};

/* ================= SEARCH (TAB-WISE, PAGINATED) ================= */

/** Search in ALL customers */
export const searchAllCustomers = async (
  query: string,
  page = 1
) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/search/all",
    {
      headers: authHeader(),
      params: { query, page },
    }
  );

  return res.data;
};

/** Search ONLY APPROVED customers */
export const searchApprovedCustomers = async (
  query: string,
  page = 1
) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/search/approved",
    {
      headers: authHeader(),
      params: { query, page },
    }
  );

  return res.data;
};

/** Search ONLY PENDING customers */
export const searchPendingCustomers = async (
  query: string,
  page = 1
) => {
  const res = await api.get<IGetCustomersResponse>(
    "/customer-kyc/search/pending",
    {
      headers: authHeader(),
      params: { query, page },
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
