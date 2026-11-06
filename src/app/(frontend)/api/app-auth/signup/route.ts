import { createAccount } from "@/lib/app-auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown
      password?: unknown
    }
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      )
    }
    if (password.length < 8) {
      return Response.json(
        { error: "Use at least 8 characters for your password." },
        { status: 400 },
      )
    }

    await createAccount(email, password)
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json(
      { error: "An account with that email may already exist." },
      { status: 400 },
    )
  }
}
