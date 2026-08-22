import type { ApiErrorBody, ApiResponse } from "@/types/api";

/**
 * The browser defaults to fixtures so the product is demonstrable before the
 * learner builds Express. Set VITE_DATA_SOURCE=rest to exercise a local API.
 */
export const isRestApiEnabled = import.meta.env.VITE_DATA_SOURCE === "rest";

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(path, {
    ...requestOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData || typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null) as ApiResponse<T> | ApiErrorBody | null;
  if (!response.ok || !payload || !payload.success) {
    const error = payload as ApiErrorBody | null;
    throw new ApiRequestError(error?.message || "The API request failed.", response.status, error?.code);
  }

  return (payload as ApiResponse<T>).data;
}
