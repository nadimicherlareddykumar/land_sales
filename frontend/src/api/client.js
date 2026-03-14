import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("re_auth_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// ── Auth ────────────────────────────────────
export const loginApi = async (email, password, isAgent = false) => {
  const { data } = await api.post("/auth/login", { email, password, isAgent });
  return data;
};

export const registerAgentApi = async (payload) => {
  const { data } = await api.post("/auth/agent/register", payload);
  return data;
};

// ── Layouts ─────────────────────────────────
export const fetchLayouts = async (params = {}) => {
  const { data } = await api.get("/layouts", { params });
  return data;
};

export const fetchLayoutById = async (id) => {
  const { data } = await api.get(`/layouts/${id}`);
  return data;
};

export const createLayout = async (payload) => {
  const { data } = await api.post("/layouts", payload);
  return data;
};

export const updateLayout = async (id, payload) => {
  const { data } = await api.put(`/layouts/${id}`, payload);
  return data;
};

export const deleteLayout = async (id) => {
  const { data } = await api.delete(`/layouts/${id}`);
  return data;
};

// ── Plots ───────────────────────────────────
export const fetchPlotsByLayout = async (layoutId) => {
  const { data } = await api.get(`/plots/layout/${layoutId}`);
  return data.plots;
};

export const createPlot = async (payload) => {
  const { data } = await api.post("/plots", payload);
  return data;
};

export const updatePlot = async (id, payload) => {
  const { data } = await api.put(`/plots/${id}`, payload);
  return data;
};

export const deletePlot = async (id) => {
  const { data } = await api.delete(`/plots/${id}`);
  return data;
};

// ── Visits ──────────────────────────────────
export const createVisit = async (payload) => {
  const { data } = await api.post("/visits", payload);
  return data;
};

export const fetchVisits = async () => {
  const { data } = await api.get("/visits");
  return data.visits;
};

export const updateVisitStatus = async (id, status) => {
  const { data } = await api.patch(`/visits/${id}/status`, { status });
  return data;
};

export default api;
