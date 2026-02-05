import api from "./axios";
import type { CustomerAnalyticsResponse } from "@/types/analyticsTypes";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ================= Analytics APIs ================= */

/**
 * Fetch customer analytics counts
 * - total customers
 * - approved customers
 * - pending customers
 */
export const getCustomerAnalytics = async () => {
  const res = await api.get<CustomerAnalyticsResponse>(
    "/analytics/countCustomers",
    {
      headers: authHeader(),
    },
  );

  return res.data;
};
