import "server-only"

import { cookies } from "next/headers"
import type { User } from "@/payload-types"
import { getPayloadClient } from "@/lib/payload"

const APP_SESSION_COOKIE = "app-session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

function getSessionCookieOptions() {
  const isEmbeddedPreview = Boolean(process.env.FIGMA_PUBLIC_URL)

  return {
    httpOnly: true,
    path: "/",
    sameSite: isEmbeddedPreview ? ("none" as const) : ("lax" as const),
    secure: isEmbeddedPreview || process.env.NODE_ENV === "production",
    ...(isEmbeddedPreview ? { partitioned: true } : {}),
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayloadClient()
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })

  if (!user || user.collection !== "users") return null
  return user
}

export async function createAccount(email: string, password: string) {
  const payload = await getPayloadClient()
  await payload.create({
    collection: "users",
    data: { email, password },
    overrideAccess: false,
  })

  return login(email, password)
}

export async function login(email: string, password: string) {
  const payload = await getPayloadClient()
  const result = await payload.login({
    collection: "users",
    data: { email, password },
    overrideAccess: false,
  })

  if (!result.token || !result.user) {
    throw new Error("Login failed.")
  }

  ;(await cookies()).set(APP_SESSION_COOKIE, result.token, {
    ...getSessionCookieOptions(),
    maxAge: SESSION_MAX_AGE,
  })

  return result.user
}

export async function logout() {
  ;(await cookies()).set(APP_SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
}
