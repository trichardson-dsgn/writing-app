import { login } from "@/lib/app-auth"

function validateCredentials(value: unknown) {
  if (!value || typeof value !== "object") return null

  const email =
    "email" in value && typeof value.email === "string"
      ? value.email.trim().toLowerCase()
      : ""
  const password =
    "password" in value && typeof value.password === "string"
      ? value.password
      : ""

  if (!email || !password) return null
  return { email, password }
}

export async function POST(request: Request) {
  try {
    const credentials = validateCredentials(await request.json())
    if (!credentials) {
      return Response.json(
        { error: "Enter your email and password." },
        { status: 400 },
      )
    }

    await login(credentials.email, credentials.password)
    return Response.json({ ok: true })
  } catch {
    return Response.json(
      { error: "The email or password is incorrect." },
      { status: 401 },
    )
  }
}
