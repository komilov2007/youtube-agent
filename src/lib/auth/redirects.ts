const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

/** Keep post-auth redirects on this application and prevent open redirects. */
export function getSafeNextPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTHENTICATED_PATH,
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const baseUrl = new URL("https://local.invalid");
    const candidate = new URL(value, baseUrl);

    if (candidate.origin !== baseUrl.origin) {
      return fallback;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return fallback;
  }
}
