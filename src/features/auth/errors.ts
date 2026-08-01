import type { AuthError } from "@supabase/supabase-js";

export function getSignInErrorMessage(error: AuthError) {
  switch (error.code) {
    case "email_not_confirmed":
      return "Confirm your email address before signing in.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a moment and try again.";
    case "invalid_credentials":
      return "Email or password is incorrect.";
    default:
      return "We could not sign you in. Check your details and try again.";
  }
}

export function getSignUpErrorMessage(error: AuthError) {
  switch (error.code) {
    case "user_already_exists":
      return "An account with this email address already exists.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many registration attempts. Wait a moment and try again.";
    case "weak_password":
      return "Choose a stronger password and try again.";
    default:
      return "We could not create your account. Please try again.";
  }
}
