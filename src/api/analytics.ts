import api from "./axios";
import type {
  CustomerAnalyticsResponse,
  SalesAnalyticsResponse,
  ProjectListResponse,
  ProjectSalesResponse,
} from "@/types/analyticsTypes";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ============================================================= */
/* ================= CUSTOMER ANALYTICS ======================== */
/* ============================================================= */

export const getCustomerAnalytics = async () => {
  const res = await api.get<CustomerAnalyticsResponse>(
    "/analytics/countCustomers",
    {
      headers: authHeader(),
    },
  );

  return res.data;
};

/* ============================================================= */
/* ================= OVERALL SALES ANALYTICS =================== */
/* ============================================================= */

export const getSalesAnalytics = async () => {
  const res = await api.get<SalesAnalyticsResponse>(
    "/analytics/salesSummary",
    {
      headers: authHeader(),
    },
  );

  return res.data;
};

/* ============================================================= */
/* ================= PROJECT DROPDOWN LIST ===================== */
/* ============================================================= */

export const getAnalyticsProjects = async () => {
  const res = await api.get<ProjectListResponse>(
    "/analytics/projects",
    {
      headers: authHeader(),
    },
  );

  return res.data;
};

/* ============================================================= */
/* ================= PROJECT-WISE SALES ======================== */
/* ============================================================= */

export const getProjectSalesAnalytics = async (projectId: string) => {
  const res = await api.get<ProjectSalesResponse>(
    `/analytics/project/${projectId}`,
    {
      headers: authHeader(),
    },
  );

  return res.data;
};
