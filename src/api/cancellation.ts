import type { IResponseCancellation } from "@/types/bookingTypes";
import api from "./axios";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const addCancellation = async (
  cancellationId: string,
  projectId: string,
  flatId: string,
  phone: string,
) => {
  const res = await api.post<any>(
    `/cancellations/attach-to-flat`,
    {
      cancellationId,
      projectId,
      flatId,
      phone,
    },
    { headers: authHeader() },
  );

  return res.data;
};

export const getCancellationData = async (
  projectId: string,
  flatId: string,
) => {
  const res = await api.get<IResponseCancellation>(
    `cancellations/${projectId}/${flatId}/cancellation-summary`,
    { headers: authHeader() },
  );

  return res.data;
};
