import { getPayloadClient } from "@/lib/payload"
import { getCurrentUser } from "@/lib/app-auth"
import {
  serializeDocument,
  validateDocumentInput,
} from "@/lib/document-persistence"

const MAX_IMPORT_COUNT = 100

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return errorResponse("Sign in to view your documents.", 401)

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "documents",
      depth: 0,
      limit: MAX_IMPORT_COUNT,
      overrideAccess: false,
      sort: "-updatedAt",
      user,
    })

    return Response.json({
      documents: result.docs.map(serializeDocument),
    })
  } catch {
    return errorResponse("Documents could not be loaded. Try again.", 500)
  }
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse("Send a valid JSON request.", 400)
  }

  const rawDocuments =
    body &&
    typeof body === "object" &&
    "documents" in body &&
    Array.isArray(body.documents)
      ? body.documents
      : [body]

  if (rawDocuments.length === 0 || rawDocuments.length > MAX_IMPORT_COUNT) {
    return errorResponse(
      `Save between 1 and ${MAX_IMPORT_COUNT} documents at a time.`,
      400,
    )
  }

  const validated = rawDocuments.map(validateDocumentInput)
  const invalid = validated.find((result) => result.error)
  if (invalid?.error) return errorResponse(invalid.error, 400)

  try {
    const user = await getCurrentUser()
    if (!user) return errorResponse("Sign in to save documents.", 401)

    const payload = await getPayloadClient()
    const documents = []

    for (const result of validated) {
      if (!result.data) continue

      const document = await payload.create({
        collection: "documents",
        data: result.data,
        depth: 0,
        overrideAccess: false,
        user,
      })
      documents.push(serializeDocument(document))
    }

    return Response.json({ documents }, { status: 201 })
  } catch {
    return errorResponse("Documents could not be saved. Try again.", 500)
  }
}
