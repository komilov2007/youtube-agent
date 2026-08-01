export type AuthFieldName =
  "email" | "password" | "fullName" | "confirmPassword";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string[]>>;

export type AuthActionResult =
  | {
      success: true;
      message: string;
      redirectTo?: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: AuthFieldErrors;
    };
