"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card mx-auto mt-16 flex max-w-sm flex-col gap-3">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <input type="password" name="password" placeholder="Password" autoFocus required />
      {error && <p className="text-sm text-deconstruct">{error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
