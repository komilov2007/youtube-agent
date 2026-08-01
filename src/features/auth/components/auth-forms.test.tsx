import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));

vi.mock("../actions", () => ({
  signInAction: mocks.signIn,
  signUpAction: mocks.signUp,
}));

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

describe("authentication forms", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows client-side login validation without calling the server", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email address/i), "invalid-email");
    await user.type(screen.getByLabelText(/^password$/i), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeVisible();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("shows registration password confirmation errors without submitting", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), "Editorial Owner");
    await user.type(
      screen.getByLabelText(/email address/i),
      "owner@example.com",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password1");
    await user.type(screen.getByLabelText(/confirm password/i), "password2");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeVisible();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("locks duplicate login submissions while the server action is pending", async () => {
    let completeSignIn:
      | ((value: {
          success: true;
          message: string;
          redirectTo: string;
        }) => void)
      | undefined;
    mocks.signIn.mockReturnValue(
      new Promise((resolve) => {
        completeSignIn = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "owner@example.com",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const pendingButton = await screen.findByRole("button", {
      name: /please wait/i,
    });
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(mocks.signIn).toHaveBeenCalledTimes(1);

    completeSignIn?.({
      success: true,
      message: "Signed in.",
      redirectTo: "/dashboard",
    });
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard"),
    );
  });
});
