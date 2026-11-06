import { redirect } from "next/navigation"
import { DocumentLibrary } from "@/components/DocumentLibrary"
import { getCurrentUser } from "@/lib/app-auth"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <DocumentLibrary email={user.email ?? ""} />
}
