export type DraftDocument = {
  id: string
  title: string
  content: string
  updatedAt: number
}

export const DOCUMENTS_STORAGE_KEY = "draft-documents-v1"

export const starterDocuments: DraftDocument[] = [
  {
    id: "quiet-tools",
    title: "The case for quiet tools",
    content:
      "The best tools do not ask to be noticed. They recede until there is only the work, the thought, and the person shaping it.\n\nSoftware can be a room with the door closed.",
    updatedAt: 1_735_689_600_000,
  },
  {
    id: "field-notes",
    title: "Field notes, early spring",
    content:
      "The mornings are brighter now. On the walk east, every window seems to hold a different version of the same pale sky.",
    updatedAt: 1_735_603_200_000,
  },
  {
    id: "untitled-fragments",
    title: "Untitled fragments",
    content:
      "A list of things worth returning to: long tables, unhurried questions, the first page of a new notebook.",
    updatedAt: 1_735_516_800_000,
  },
  {
    id: "things-to-remember",
    title: "Things to remember",
    content:
      "Leave more space than you think you need. Read the sentence aloud. Keep the useful edge and remove the rest.",
    updatedAt: 1_735_430_400_000,
  },
]

export function readLocalDocuments() {
  try {
    const stored = window.localStorage.getItem(DOCUMENTS_STORAGE_KEY)
    if (!stored) return starterDocuments

    const documents = JSON.parse(stored) as DraftDocument[]
    return Array.isArray(documents) ? documents : starterDocuments
  } catch {
    return starterDocuments
  }
}

export function clearLocalDocuments() {
  window.localStorage.removeItem(DOCUMENTS_STORAGE_KEY)
}

async function readResponse<T>(response: Response) {
  const result = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(result.error || "The document service is unavailable.")
  }
  return result
}

export async function loadDocuments() {
  const response = await fetch("/api/drafts", { cache: "no-store" })
  const result = await readResponse<{ documents: DraftDocument[] }>(response)
  return result.documents
}

export async function createDocuments(
  documents: Array<Pick<DraftDocument, "title" | "content">>,
) {
  const response = await fetch("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents }),
  })
  const result = await readResponse<{ documents: DraftDocument[] }>(response)
  return result.documents
}

export async function saveDocument(
  document: DraftDocument,
  options: { keepalive?: boolean } = {},
) {
  const response = await fetch(
    `/api/drafts/${encodeURIComponent(document.id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      keepalive: options.keepalive,
      body: JSON.stringify({
        title: document.title,
        content: document.content,
      }),
    },
  )
  const result = await readResponse<{ document: DraftDocument }>(response)
  return result.document
}

export async function deleteDocument(id: string) {
  const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  await readResponse<{ ok: boolean }>(response)
}

export function excerpt(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 118)
}
