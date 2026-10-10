"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSessionToken } from "@/lib/auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!checkPassword(String(form.get("password") ?? ""))) return "Wrong password.";
  // HTTPS-only cookie when the request came over HTTPS (the VPS behind a proxy sets
  // x-forwarded-proto). On a plain-http home network a secure cookie would be dropped.
  const proto = (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim();
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  redirect("/");
}
