/* ================= REQUEST TYPES ================= */

export interface UpsertSchedulePayload {
  phone: string;
  date: string; // YYYY-MM-DD
}

/* ================= RESPONSE TYPES ================= */

export interface ScheduleData {
  phone: string;
  date: string;
}

export interface UpsertScheduleResponse {
  success: boolean;
  message: string;
  data: ScheduleData;
}

export interface GetScheduleResponse {
  success: boolean;
  data?: ScheduleData;
  message?: string;
}
