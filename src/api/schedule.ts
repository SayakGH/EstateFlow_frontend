import api from "./axios";
import type {
  UpsertSchedulePayload,
  UpsertScheduleResponse,
  GetScheduleResponse,
} from "@/types/schedule";

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= UPSERT SCHEDULE ================= */

/**
 * Creates or updates schedule
 * POST /schedule
 */
export const upsertSchedule = async (payload: UpsertSchedulePayload) => {
  const res = await api.post<UpsertScheduleResponse>("/schedule", payload, {
    headers: authHeader(),
  });

  return res.data;
};

/* ================= GET SCHEDULE BY PHONE ================= */

/**
 * Fetch date using phone
 * GET /schedule/:phone
 */
export const getScheduleByPhone = async (phone: string) => {
  const res = await api.get<GetScheduleResponse>(`/schedule/${phone}`, {
    headers: authHeader(),
  });

  return res.data;
};
