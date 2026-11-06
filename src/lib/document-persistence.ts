import "server-only"

import type { Document } from "@/payload-types"

export const DOCUMENT_TITLE_LIMIT = 300
export const DOCUMENT_CONTENT_LIMIT = 100_000

export type PersistedDocument = {
  id: string
  title: string
  content: string
  updatedAt: number
}

export type DocumentInput = {
  title: string
  content: string
}

export function serializeDocument(document: Document): PersistedDocument {
  return {
    id: String(document.id),
    title: document.title ?? "",
    content: document.content ?? "",
    updatedAt: new Date(document.updatedAt).getTime(),
  }
}

export function validateDocumentInput(
  value: unknown,
): {
  data: DocumentInput
  error?: never
} | {
  data?: never
  error: string
} {
  if (!value || typeof value !== "object") {
    return { error: "Send a valid document." }
  }

  const title =
    "title" in value && typeof value.title === "string" ? value.title : ""
  const content =
    "content" in value && typeof value.content === "string" ? value.content : ""

  if (title.length > DOCUMENT_TITLE_LIMIT) {
    return {
      error: `Titles can be at most ${DOCUMENT_TITLE_LIMIT} characters.`,
    }
  }

  if (content.length > DOCUMENT_CONTENT_LIMIT) {
    return {
      error: `Documents can be at most ${DOCUMENT_CONTENT_LIMIT.toLocaleString()} characters.`,
    }
  }

  return { data: { title, content } }
}
