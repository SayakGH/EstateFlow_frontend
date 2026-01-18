import api from "./axios";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
  FlatPayload,
  GetAllProjectsResponse,
} from "@/types/projectTypes";

/* ================= Auth Header ================= */

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllProjects = async () => {
  const res = await api.get<GetAllProjectsResponse>("/projects", {
    headers: authHeader(),
  });

  return res.data;
};

export const createProject = async (payload: CreateProjectPayload) => {
  const res = await api.post<CreateProjectResponse>("/projects", payload, {
    headers: authHeader(),
  });

  return res.data;
};

export const getProjectFlats = async (projectId: string) => {
  const res = await api.get<{
    success: boolean;
    flats: FlatPayload[];
  }>(`/projects/flats/${projectId}`, {
    headers: authHeader(),
  });

  return res.data;
};
