const VALID_SAME_SITE = new Set(["Strict", "Lax", "None"]);

function normalizeSameSite(sameSiteValue) {
  if (typeof sameSiteValue !== "string") {
    return "Lax";
  }

  const normalized = sameSiteValue.trim().toLowerCase();

  if (normalized.includes("strict")) return "Strict";
  if (normalized.includes("none") || normalized.includes("no_restriction")) return "None";
  if (normalized.includes("lax")) return "Lax";

  return "Lax";
}

export function normalizeCookies(cookies) {
  if (!Array.isArray(cookies)) {
    return [];
  }

  return cookies
    .filter((cookie) => cookie && cookie.name && cookie.value)
    .map((cookie) => {
      const sameSite = normalizeSameSite(cookie.sameSite);

      return {
        name: String(cookie.name),
        value: String(cookie.value),
        domain: ".instagram.com",
        path: "/",
        secure: true,
        httpOnly: Boolean(cookie.httpOnly),
        sameSite: VALID_SAME_SITE.has(sameSite) ? sameSite : "Lax",
        expires: Number.isFinite(cookie.expires)
          ? cookie.expires
          : Number.isFinite(cookie.expirationDate)
            ? Math.trunc(cookie.expirationDate)
            : -1
      };
    });
}
