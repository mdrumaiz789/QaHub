const TOKEN_KEY = "qahub_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const apiUrl = (path: string) =>
  `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}${path}`;
