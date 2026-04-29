export async function apiFetch<T>(url: string, options: RequestInit & { fullResponse?: boolean } = {}): Promise<T> {
  const { fullResponse, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sv_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  console.log(`[apiFetch] ${fetchOptions.method || "GET"} ${url}`);

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  let result: any;
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    try {
      result = await res.json();
    } catch (e) {
      console.error(`[apiFetch] JSON parse error for ${url}`, e);
      throw new Error("Failed to parse JSON response from server");
    }
  } else {
    // If not JSON, it's likely a 404 or 500 HTML page from Next.js
    const text = await res.text();
    console.error(`[apiFetch] Non-JSON response received for ${url} (Status ${res.status})`);
    console.error(`[apiFetch] Response body preview: ${text.slice(0, 200)}...`);

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      throw new Error(`Server returned HTML instead of JSON (Status ${res.status}). This usually means the API route was not found or a server-side error occurred.`);
    }
    result = { message: text || `Request failed with status ${res.status}`, success: false };
  }

  const { success, data, ...rest } = result;
  
  if (!res.ok || success === false) {
    const errorMsg = result.message || result.error || rest.message || `Request failed with status ${res.status}`;
    console.error(`[apiFetch] Request failed: ${errorMsg}`, { status: res.status, result });
    throw new Error(errorMsg);
  }

  if (fullResponse) {
    return result as T;
  }

  return (data !== undefined ? data : rest) as T;
}
