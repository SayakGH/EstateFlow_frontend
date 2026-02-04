/* ================= Project Types ================= */

export type FlatStatus = "free" | "booked" | "sold";

export interface FlatPayload {
  block: string;
  floor: number;
  flatno: string;
  sqft: number;
  bhk: number;
  status: FlatStatus;
}

export interface CreateProjectPayload {
  name: string;
  flats: FlatPayload[];
}

/* ================= API Responses ================= */

export interface IProject {
  projectId: string;
  name: string;
  totalApartments: number;
  totalBlocks: number;
  soldApartments: number;
  freeApartments: number;
  bookedApartments: number;

  createdAt: string;
}

export interface IFlat {
  projectId: string;
  name: string;
  totalApartments: number;
  totalBlocks: number;
  flatId: string;
  block: string;
  floor: number;
  bhk: string;
  sqft: number;
  flatno: string;
  soldApartments: number;
  freeApartments: number;
  bookedApartments: number;
  latestInvoiceId?: string | null;
  rootInvoiceId?: string | null;
  status: "free" | "booked" | "sold";
  createdAt: string;
  latestCancellationId?: string | null;
  rootCancellationId?: string | null;
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;
  project: IProject;
}

export interface GetAllProjectsResponse {
  success: boolean;
  projects: IProject[];
}

export interface IProjectName {
  id: string;
  name: string;
}

export interface GetAllProjectNamesResponse {
  success: boolean;
  projects: IProjectName[];
}
