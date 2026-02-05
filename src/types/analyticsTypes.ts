/* ================= Analytics Types ================= */

export interface CustomerAnalyticsData {
  totalCustomers: number;
  approvedCustomers: number;
  pendingCustomers: number;
}

export interface CustomerAnalyticsResponse {
  success: boolean;
  data: CustomerAnalyticsData;
}
