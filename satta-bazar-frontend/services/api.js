
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const API_PREFIX = `${API_BASE_URL}/api/v1`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || String(item))
      .join(" ");
  }

  if (data?.detail && typeof data.detail === "object") {
    return Object.values(data.detail).flat().join(" ");
  }

  if (data && typeof data === "object") {
    return Object.values(data)
      .flat()
      .map((item) =>
        typeof item === "string" ? item : JSON.stringify(item)
      )
      .join(" ");
  }

  return fallback;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => null);
}

async function request(
  path,
  { method = "GET", body, headers: extraHeaders = {} } = {}
) {
  const headers = {
    Accept: "application/json",
    ...extraHeaders,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Cannot connect to the server. Check your API URL and backend status.",
      0
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, `Request failed (${response.status}).`),
      response.status
    );
  }

  return data;
}

function getCookieToken(name) {
  const prefix = `${name}=`;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

async function getCsrfToken() {
  // The backend must return csrfToken in its JSON response
  // when frontend and backend are on separate domains.
  const data = await request("/auth/csrf/");

  const token =
    data?.csrfToken ||
    data?.csrf_token ||
    getCookieToken("csrftoken");

  if (!token) {
    throw new ApiError(
      "CSRF token missing. Check the backend CSRF endpoint.",
      403
    );
  }

  return token;
}

async function csrfRequest(path, body = {}) {
  const token = await getCsrfToken();

  return request(path, {
    method: "POST",
    body,
    headers: {
      "X-CSRFToken": token,
    },
  });
}

// Market
export function getMarketOverview() {
  return request("/market/overview/");
}

export function getMarketMovers() {
  return request("/market/movers/");
}

export function getLeaderboard() {
  return request("/leaderboards/");
}

// Authentication
export function getMe() {
  return request("/auth/me/");
}

export function login(credentials) {
  return csrfRequest("/auth/login/", credentials);
}

export function register(details) {
  return csrfRequest("/auth/register/", details);
}

export function logout() {
  return csrfRequest("/auth/logout/");
}

// Wallet and trading
export function getWallet() {
  return request("/wallet/");
}

export function buyAsset(trade) {
  return csrfRequest("/trades/buy/", trade);
}

export function sellAsset(trade) {
  return csrfRequest("/trades/sell/", trade);
}

// Asset history
export function getAssetHistory(symbol) {
  return request(
    `/assets/${encodeURIComponent(symbol)}/history/`
  );
}
