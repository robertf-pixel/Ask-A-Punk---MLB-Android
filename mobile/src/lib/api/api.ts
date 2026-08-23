import { fetch } from "expo/fetch";

// Response envelope type - all app routes return { data: T }
interface ApiResponse<T> {
  data: T;
}

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL!;

const request = async <T>(
  url: string,
  options: { method?: string; body?: string } = {}
): Promise<T> => {
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_BACKEND_URL is missing");
  }

  const fullUrl = `${baseUrl}${url}`;

  console.log("Requesting:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: options.body
        ? { "Content-Type": "application/json" }
        : undefined,
    });

    console.log("Response status:", response.status);

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`API ${response.status}: ${message}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const json: ApiResponse<T> = await response.json();
      return json.data;
    }

    throw new Error(`Expected JSON but received: ${contentType}`);
  } catch (error) {
    console.error("API request failed:", fullUrl, error);
    throw error;
  }
};

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: any) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
  patch: <T>(url: string, body: any) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
};
