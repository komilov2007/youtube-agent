export function getAuthPageError(code: string | undefined) {
  switch (code) {
    case "missing_code":
      return "This confirmation link is incomplete. Request a new link and try again.";
    case "verification_failed":
      return "This confirmation link is invalid or has expired. Please try again.";
    case "auth_required":
      return "Sign in to continue to that page.";
    default:
      return undefined;
  }
}
