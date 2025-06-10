import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Tickets API
export const getTickets = async (params?: {
  departureCity?: string;
  destinationCity?: string;
  isOneWay?: boolean;
  passengers?: number;
}) => {
  const response = await api.get("/tickets", { params });
  return response.data;
};

export const getHotTickets = async () => {
  const response = await api.get("/tickets/hot");
  return response.data;
};

export const getTicketById = async (id: string) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

// Bookings API
export const createBooking = async (bookingData: {
  ticketId: string;
  numberOfPassengers: number;
  userId: string;
}) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getBookingsByUserId = async (userId: string) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
};

export const downloadBookingPdf = async (bookingId: string) => {
  const response = await api.get(`/bookings/${bookingId}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `booking_${bookingId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Existing authentication and user-related APIs
export const register = async (userData: any) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials: any) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getWorkerOrders = async () => {
  const response = await api.get("/worker_orders");
  return response.data;
};

export const createWorkerOrder = async (orderData: any) => {
  const response = await api.post("/worker_orders", orderData);
  return response.data;
};

export const updateWorkerOrderStatus = async (id: string, status: string) => {
  const response = await api.put(`/worker_orders/${id}/status`, { status });
  return response.data;
};

export const getUser = async (token: string) => {
  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Train Tickets API
export const searchTrainTickets = async (params: {
  departureCity?: string;
  destinationCity?: string;
  minPrice?: number;
  maxPrice?: number;
  class?: string;
}) => {
  const response = await api.get("/train-tickets/search", { params });
  return response.data;
};

export const getHotTrainTickets = async () => {
  const response = await api.get("/train-tickets/hot");
  return response.data;
};

export const getTrainTicketById = async (id: string) => {
  const response = await api.get(`/train-tickets/${id}`);
  return response.data;
};
