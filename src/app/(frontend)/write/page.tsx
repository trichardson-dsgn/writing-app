import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Composer } from "@/components/Composer"
import { getCurrentUser } from "@/lib/app-auth"

export const metadata: Metadata = {
  title: 'Write — Draft',
}

export default async function WritePage() {
  if (!(await getCurrentUser())) redirect("/login")
  return <Composer />
}
