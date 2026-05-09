// src/api/http.ts
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://unfatalistic-adulatory-karter.ngrok-free.dev";

function buildUrl(path: string): string {
  const base = (API_BASE || "").replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: any;
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = buildUrl(path);
  const token = localStorage.getItem("token");

  const hasBody = options.body !== undefined && options.body !== null;
  const isForm = options.body instanceof FormData;

  let bodyToSend: BodyInit | undefined = undefined;
  if (hasBody) {
    const b = options.body;

    const isPlainObject =
      typeof b === "object" &&
      !isForm &&
      !(b instanceof Blob) &&
      !(b instanceof ArrayBuffer);

    bodyToSend = isPlainObject ? JSON.stringify(b) : (b as BodyInit);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        ...(hasBody && !isForm ? { "Content-Type": "application/json" } : {}),
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: bodyToSend,
    });
  } catch {
    throw new Error("فشل الاتصال بالسيرفر ");
  }

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  if (!contentType.includes("application/json")) {
    const short = rawText?.slice(0, 200)?.replace(/\s+/g, " ") || "";
    throw new Error(`HTTP ${res.status} → ${path}${short ? ` | ${short}` : ""}`);
  }

  const data = rawText ? JSON.parse(rawText) : null;

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "") ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
