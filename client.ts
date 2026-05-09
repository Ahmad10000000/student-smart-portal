// src/api/client.ts
import { apiFetch } from "./http";

export const client = {
  get<T = any>(path: string) {
    return apiFetch(path) as Promise<T>;
  },

  post<T = any>(path: string, body?: any) {
    return apiFetch(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }) as Promise<T>;
  },

  put<T = any>(path: string, body?: any) {
    return apiFetch(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }) as Promise<T>;
  },

  delete<T = any>(path: string) {
    return apiFetch(path, {
      method: "DELETE",
    }) as Promise<T>;
  },
};
