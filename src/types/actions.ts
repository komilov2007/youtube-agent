export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = null> =
  | {
      ok: true;
      message: string;
      data: T;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
    };
