export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const APP_NAME = "Placement Cell";

export const DEMO_AUTH_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH !== "false";

export const MOCKS_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== "false";
