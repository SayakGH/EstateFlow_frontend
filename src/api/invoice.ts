import api from "./axios";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const addInvoice = async (
  invoiceId: string,
  projectId: string,
  flatId: string,
) => {
  const res = await api.post<any>(
    `/invoices/attach-to-flat`,
    {
      invoiceId,
      projectId,
      flatId,
    },
    { headers: authHeader() },
  );

  return res.data;
};
export const removeInvoice = async (
  projectId: string,
  flatId: string,
  phone: string,
) => {
  const res = await api.patch<any>(
    `/invoices/reset`,
    {
      projectId,
      flatId,
      phone,
    },
    { headers: authHeader() },
  );

  return res.data;
};
