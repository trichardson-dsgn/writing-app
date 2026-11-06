import { getPayloadClient } from "@/lib/payload"
import { getCurrentUser } from "@/lib/app-auth"
import {
  serializeDocument,
  validateDocumentInput,
} from "@/lib/document-persistence"

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/drafts/[id]">,
) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse("Send a valid JSON request.", 400)
  }

  const validated = validateDocumentInput(body)
  if (!validated.data) return errorResponse(validated.error, 400)

  try {
    const user = await getCurrentUser()
    if (!user) return errorResponse("Sign in to save this document.", 401)

    const { id } = await context.params
    const payload = await getPayloadClient()
    const document = await payload.update({
      collection: "documents",
      id,
      data: validated.data,
      depth: 0,
      overrideAccess: false,
      user,
    })

    return Response.json({ document: serializeDocument(document) })
  } catch {
    return errorResponse("This document could not be saved.", 404)
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/drafts/[id]">,
) {
  try {
    const user = await getCurrentUser()
    if (!user) return errorResponse("Sign in to delete this document.", 401)

    const { id } = await context.params
    const payload = await getPayloadClient()
    await payload.delete({
      collection: "documents",
      id,
      depth: 0,
      overrideAccess: false,
      user,
    })

    return Response.json({ ok: true })
  } catch {
    return errorResponse("This note could not be deleted.", 404)
  }
}
