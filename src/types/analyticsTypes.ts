/* ================= Customer Analytics ================= */

export interface CustomerAnalyticsData {
  totalCustomers: number;
  approvedCustomers: number;
  pendingCustomers: number;
}

export interface CustomerAnalyticsResponse {
  success: boolean;
  data: CustomerAnalyticsData;
}

/* ================= Overall Sales Analytics ================= */

export interface SalesAnalyticsData {
  totalProjects: number;
  totalApartments: number;
  freeApartments: number;
  bookedApartments: number;
  soldApartments: number;
}

export interface SalesAnalyticsResponse {
  success: boolean;
  data: SalesAnalyticsData;
}

/* ============================================================= */
/* ================= Project Dropdown Types ===================== */
/* ============================================================= */

export interface AnalyticsProject {
  id: string;
  name: string;
}

export interface ProjectListResponse {
  success: boolean;
  projects: AnalyticsProject[];
}

/* ============================================================= */
/* ================= Project-wise Sales Types =================== */
/* ============================================================= */

export interface ProjectSalesData {
  projectId: string;
  totalApartments: number;
  freeApartments: number;
  bookedApartments: number;
  soldApartments: number;
}

export interface ProjectSalesResponse {
  success: boolean;
  data: ProjectSalesData;
}
