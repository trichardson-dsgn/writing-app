"use client"

import { useEffect, useRef, useState } from "react"
import { Spinner } from "@/components/LoadingState"

type Card = {
  idea: string
  explanation: string
  connection: string
  sourceTitle: string
  url: string
  whySource: string
}

export function ResearchPanel({ title, content, onClose }: {
  title: string
  content: string
  onClose: () => void
}) {
  const source = [title, content].filter(Boolean).join("\n\n").trim()
  const [cards, setCards] = useState<Card[]>([])
  const [phase, setPhase] = useState<"idle" | "searching" | "done">("idle")
  const [researched, setResearched] = useState("")
  const [error, setError] = useState("")
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function research() {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setError("")
    setPhase("searching")
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: source }),
        signal: abort.signal,
      })
      const data = await response.json() as { cards: Card[]; error?: string }
      if (!response.ok) throw new Error(data.error || "Research is unavailable.")
      setCards(data.cards)
      setResearched(source)
      setPhase("done")
    } catch (caught) {
      if (abort.signal.aborted) return
      setError(caught instanceof Error ? caught.message : "Research is unavailable.")
      setPhase(researched ? "done" : "idle")
    }
  }

  return (
    <aside aria-label="Web research" className="fixed inset-y-0 right-0 z-20 flex w-full flex-col border-l border-[#e7e5de] bg-[#fbfaf7] sm:w-[400px]">
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <span className="text-xs font-medium tracking-wide">Research</span>
        <button type="button" onClick={onClose} aria-label="Close research panel" className="grid size-9 place-items-center text-stone-500 hover:text-stone-900 focus-visible:outline-2">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-10">
        <div className="border-b border-stone-200 pb-6 pt-4">
          <p className="text-xs uppercase tracking-widest text-stone-500">Go deeper, not broader</p>
          <h2 className="mt-3 font-serif text-2xl leading-snug">Follow the ideas.</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Explore the thinking behind your note through original essays, expert blogs,
            and primary sources. No listicles. No rewritten drafts.
          </p>
          <button type="button" onClick={() => void research()} disabled={!source || source.length > 16000 || phase === "searching"}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 bg-stone-900 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2">
            {phase === "searching" && <Spinner />}
            {phase === "searching" ? "Researching the web…" : researched ? "Research again" : "Research this note"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            {!source ? "Write a little first to give your research a starting point." :
              source.length > 16000 ? "Use a note under 16,000 characters." :
              "Your note is sent to OpenAI only when you research. Your writing stays untouched."}
          </p>
        </div>
        <div aria-live="polite" aria-busy={phase === "searching"}>
          {phase === "searching" && <p role="status" className="py-6 font-serif text-sm leading-relaxed text-stone-500">Tracing key ideas and looking for substantive sources. This may take a minute.</p>}
          {researched && source !== researched && <p className="mt-5 border-l-2 border-stone-300 pl-3 text-xs leading-relaxed text-stone-600">Your note has changed. Research again to update these connections.</p>}
          {phase === "done" && cards.length === 0 && <p className="py-6 text-sm leading-relaxed text-stone-600">No sufficiently strong, sourced matches came back. Add more detail or a specific claim to your note, then try again.</p>}
          {cards.length > 0 && (
            <div className="mt-6 space-y-4">
              <p className="text-xs uppercase tracking-widest text-stone-500">{cards.length} ideas to explore</p>
              {cards.map((card, index) => (
                <article key={card.url} className="border border-stone-200 bg-white/50 p-5">
                  <span className="text-xs tabular-nums text-stone-400">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-serif text-xl leading-snug">{card.idea}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{card.explanation}</p>
                  <div className="mt-4 border-l-2 border-stone-200 pl-3">
                    <p className="text-xs font-medium text-stone-500">In your note</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{card.connection}</p>
                  </div>
                  <div className="mt-5 border-t border-stone-200 pt-4">
                    <p className="break-all text-xs text-stone-500">{new URL(card.url).hostname.replace(/^www\./, "")}</p>
                    <a href={card.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-medium underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900 focus-visible:outline-2">
                      {card.sourceTitle}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <p className="mt-2 text-xs leading-relaxed text-stone-500">{card.whySource}</p>
                  </div>
                </article>
              ))}
              <p className="text-xs leading-relaxed text-stone-500">AI-synthesized explanations. Read the original sources to check context and claims.</p>
            </div>
          )}
        </div>
        {error && <p role="alert" className="mt-6 text-sm leading-relaxed text-red-800">{error}</p>}
      </div>
    </aside>
  )
}
