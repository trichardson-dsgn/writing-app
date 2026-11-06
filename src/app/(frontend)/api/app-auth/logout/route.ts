import { logout } from "@/lib/app-auth"

export async function POST() {
  await logout()
  return Response.json({ ok: true })
}
