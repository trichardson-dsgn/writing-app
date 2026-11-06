"use client"
// Keep the editor open so the visible error can be resolved before exit.
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  type MouseEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  ComposerLoadingScreen,
  LibraryLoadingScreen,
} from "@/components/LoadingState"
import {
  clearLocalDocuments,
  createDocuments,
  loadDocuments,
  readLocalDocuments,
  saveDocument,
  type DraftDocument,
} from "@/lib/documents"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import { ResearchPanel } from "@/components/ResearchPanel"

const emptyDraft: DraftDocument = {
  id: "",
  title: "",
  content: "",
  updatedAt: 0,
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <path
        d="M16 10H4m0 0 5-5m-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <path
        d="M10 2.8c.5 4.45 2.75 6.7 7.2 7.2-4.45.5-6.7 2.75-7.2 7.2-.5-4.45-2.75-6.7-7.2-7.2 4.45-.5 6.7-2.75 7.2-7.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Composer() {
  const router = useRouter()
  const [draft, setDraft] = useState<DraftDocument>(emptyDraft)
  const [ready, setReady] = useState(false)
  const [status, setStatus] =
    useState<"error" | "saved" | "saving">("saved")
  const [error, setError] = useState("")
  const [leaving, setLeaving] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDraft = useRef<DraftDocument>(emptyDraft)
  const saveSequence = useRef(0)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  function persistDraft(document: DraftDocument) {
    const request = saveQueue.current
      .catch(() => undefined)
      .then(() => saveDocument(document))

    saveQueue.current = request.then(
      () => undefined,
      () => undefined,
    )

    return request
  }

  async function flushDraft() {
    if (!ready || !latestDraft.current.id) return
    if (saveTimer.current) clearTimeout(saveTimer.current)

    const sequence = saveSequence.current
    setStatus("saving")

    try {
      await persistDraft(latestDraft.current)
      if (sequence === saveSequence.current) {
        setError("")
        setStatus("saved")
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "This document could not be saved.",
      )
      setStatus("error")
      throw caught
    }
  }

  async function handleExit(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    setLeaving(true)

    try {
      await flushDraft()
      router.push("/")
    } catch {
      setLeaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function hydrateDraft() {
      try {
        const hash = window.location.hash.slice(1)
        let documents = await loadDocuments()
        let migratedDraft: DraftDocument | undefined

        if (documents.length === 0 && hash !== "new") {
          const localDocuments = readLocalDocuments()
          const localDraftIndex = localDocuments.findIndex(
            (document) => document.id === hash,
          )
          documents = await createDocuments(localDocuments)
          migratedDraft =
            localDraftIndex >= 0 ? documents[localDraftIndex] : undefined
          clearLocalDocuments()
        }

        let current =
          migratedDraft ?? documents.find((document) => document.id === hash)

        if (!current || hash === "new") {
          const created = await createDocuments([{ title: "", content: "" }])
          current = created[0]
        }

        if (!current) throw new Error("The document could not be opened.")
        if (cancelled) return

        window.history.replaceState(null, "", `/write#${current.id}`)
        latestDraft.current = current
        setDraft(current)
        setReady(true)
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The document could not be opened.",
          )
          setStatus("error")
          setReady(true)
        }
      }
    }

    void hydrateDraft()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !draft.id) return

    latestDraft.current = draft
    const sequence = ++saveSequence.current
    setStatus("saving")
    if (saveTimer.current) clearTimeout(saveTimer.current)

    saveTimer.current = setTimeout(async () => {
      try {
        await persistDraft(draft)
        if (sequence === saveSequence.current) {
          setError("")
          setStatus("saved")
        }
      } catch (caught) {
        if (sequence !== saveSequence.current) return
        setError(
          caught instanceof Error
            ? caught.message
            : "This document could not be saved.",
        )
        setStatus("error")
      }
    }, 150)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft, ready])

  useEffect(() => {
    function saveBeforePageExit() {
      const current = latestDraft.current
      if (!ready || !current.id) return
      void saveDocument(current, { keepalive: true })
    }

    window.addEventListener("pagehide", saveBeforePageExit)
    return () => window.removeEventListener("pagehide", saveBeforePageExit)
  }, [ready])

  useLayoutEffect(() => {
    const title = titleRef.current
    if (!title) return

    title.style.height = "0px"
    title.style.height = `${title.scrollHeight}px`
  }, [draft.title])

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return

    event.preventDefault()
    bodyRef.current?.querySelector<HTMLElement>(".md-editor")?.focus()
  }

  if (leaving) return <LibraryLoadingScreen />
  if (!ready) return <ComposerLoadingScreen />

  return (
    <main
      className={`min-h-screen bg-[#fbfaf7] text-[#191918] transition-[padding] ${panelOpen ? "sm:pr-[400px]" : ""}`}
    >
      <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-4 sm:px-7">
        <Link
          href="/"
          onClick={handleExit}
          aria-label="Back to documents"
          className="grid size-9 place-items-center text-[#77766f] transition-colors hover:text-[#191918] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191918]"
        >
          <ArrowIcon />
        </Link>

        <div className="flex items-center gap-4">
          <span
            className="hidden text-[11px] text-[#8a8982] sm:block"
            aria-live="polite"
          >
            {status === "saving"
                ? "Saving…"
                : status === "error"
                  ? "Not saved"
                  : "Saved"}
          </span>
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            className="inline-flex h-9 min-w-24 items-center justify-center gap-2 bg-[#191918] px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#191918]"
          >
            <SparkIcon />
            Research
          </button>
        </div>
      </header>

      <article
        className="mx-auto min-h-screen max-w-[760px] px-6 pb-32 pt-32 sm:px-10 sm:pt-40"
      >
        <textarea
          ref={titleRef}
          aria-label="Document title"
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          rows={1}
          className="mb-10 block w-full resize-none overflow-hidden bg-transparent py-[0.08em] text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.04] font-medium tracking-[-0.025em] outline-none placeholder:text-[#d0cec6]"
        />
        <div ref={bodyRef}>
          <MarkdownEditor
            value={draft.content}
            onChange={(content) =>
              setDraft((current) => ({ ...current, content }))
            }
            placeholder="Start writing…"
            className="block min-h-[55vh] w-full whitespace-pre-wrap break-words bg-transparent font-serif text-[17px] leading-[1.75] tracking-[-0.01em] text-[#302f2c] outline-none"
          />
        </div>
        {error && (
          <p role="alert" className="mt-6 text-[12px] text-[#a33a2b]">
            {error}
          </p>
        )}
      </article>
      {panelOpen && (
        <ResearchPanel
          title={draft.title}
          content={draft.content}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </main>
  )
}
