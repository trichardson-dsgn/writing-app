import { redirect } from "next/navigation"
import { AuthForm } from "@/components/AuthForm"
import { getCurrentUser } from "@/lib/app-auth"

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/")
  return <AuthForm />
}
