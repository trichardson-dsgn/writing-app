"use client"

import Link from "next/link"
import { type MouseEvent, useEffect, useState } from "react"
import {
  ComposerLoadingScreen,
  DocumentGridSkeleton,
  LoginLoadingScreen,
} from "@/components/LoadingState"
import {
  clearLocalDocuments,
  createDocuments,
  excerpt,
  loadDocuments,
  readLocalDocuments,
  type DraftDocument,
} from "@/lib/documents"

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(timestamp)
}

export function DocumentLibrary({ email }: { email: string }) {
  const [documents, setDocuments] = useState<DraftDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  function showComposerOnClick(
    event: MouseEvent<HTMLAnchorElement>,
    documentId: string,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    setOpeningId(documentId)
  }

  useEffect(() => {
    let cancelled = false

    async function hydrateDocuments() {
      try {
        let persisted = await loadDocuments()

        if (persisted.length === 0) {
          persisted = await createDocuments(readLocalDocuments())
          clearLocalDocuments()
        }

        if (!cancelled) setDocuments(persisted)
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Documents could not be loaded.",
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void hydrateDocuments()
    return () => {
      cancelled = true
    }
  }, [])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    setError("")

    try {
      const response = await fetch("/api/app-auth/logout", { method: "POST" })
      if (!response.ok) throw new Error("Could not sign out. Please try again.")
      clearLocalDocuments()
      window.location.assign("/login")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign out.")
      setSigningOut(false)
    }
  }

  if (openingId !== null) return <ComposerLoadingScreen />
  if (signingOut) return <LoginLoadingScreen />

  return (
    <main
      className="min-h-screen bg-[#f5f4ef] px-5 py-6 text-[#191918] sm:px-8 sm:py-8 lg:px-12"
      aria-busy={loading || openingId !== null || signingOut}
    >
      <div className="mx-auto max-w-[1360px]">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Draft home"
            className="grid size-8 place-items-center bg-[#191918] text-[12px] font-semibold tracking-[-0.04em] text-white"
          >
            D
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={signOut}
              aria-label={`Sign out of ${email}`}
              disabled={signingOut}
              className="inline-flex h-9 cursor-pointer items-center justify-center border border-transparent px-3.5 text-[13px] font-medium text-[#77766f] transition-colors hover:border-[#cfcdc4] hover:text-[#191918] focus-visible:border-[#cfcdc4] focus-visible:text-[#191918] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#191918] disabled:cursor-wait disabled:opacity-60"
            >
              Sign out
            </button>
            <Link
              href="/write#new"
              onClick={(event) => showComposerOnClick(event, "new")}
              className="group inline-flex h-9 items-center gap-2 border border-[#cfcdc4] bg-[#f5f4ef] px-3.5 text-[13px] font-medium transition-colors hover:border-[#191918] hover:bg-[#191918] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#191918]"
            >
              <PlusIcon />
              New document
            </Link>
          </div>
        </header>

        <section className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[clamp(2.5rem,5vw,4.75rem)] leading-[0.95] font-medium tracking-[-0.055em]">
              Documents
            </h1>
          </div>

          {error && (
            <p role="alert" className="mb-6 text-[12px] text-[#a33a2b]">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 border-l border-t border-[#cfcdc4] sm:grid-cols-2 xl:grid-cols-4">
            {loading && <DocumentGridSkeleton />}
            {documents.map((document) => (
              <Link
                key={document.id}
                href={`/write#${document.id}`}
                onClick={(event) => showComposerOnClick(event, document.id)}
                className="group flex min-h-44 flex-col justify-between gap-8 border-b border-r border-[#cfcdc4] p-5 transition-colors duration-200 hover:bg-white focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#191918] sm:min-h-48 sm:p-6"
              >
                <div>
                  <h2 className="max-w-[14rem] text-[24px] leading-[1.08] font-medium tracking-[-0.035em]">
                    {document.title || "Untitled"}
                  </h2>
                  <p className="mt-3 line-clamp-2 min-h-12 max-w-[16rem] font-serif text-[14px] leading-6 text-[#77766f]">
                    {excerpt(document.content) || "An empty page."}
                  </p>
                </div>
                <span className="text-[11px] tabular-nums text-[#8a8982]">
                  {formatDate(document.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
