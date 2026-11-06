"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/LoadingState"

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    try {
      const response = await fetch(`/api/app-auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || "Could not continue.")

      router.replace("/")
      router.refresh()
      return
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not continue.")
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f4ef] px-5 text-[#191918]">
      <section
        className="w-full max-w-[420px] border border-[#cfcdc4] bg-[#fbfaf7] p-7 sm:p-10"
        aria-busy={pending}
      >
        <div className="mb-12 grid size-9 place-items-center bg-[#191918] text-[13px] font-semibold text-white">
          D
        </div>
        <h1 className="text-[42px] leading-none font-medium tracking-[-0.025em]">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        {mode === "signup" && (
          <p className="mt-4 font-serif text-[15px] leading-6 text-[#77766f]">
            Your notes will be private and tied to this account.
          </p>
        )}

        <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full border border-[#cfcdc4] bg-white px-3 text-[14px] outline-none focus:border-[#191918]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium">Password</span>
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              required
              disabled={pending}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full border border-[#cfcdc4] bg-white px-3 text-[14px] outline-none focus:border-[#191918]"
            />
          </label>
          {error && (
            <p role="alert" className="text-[12px] text-[#a33a2b]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#191918] text-[13px] font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-70"
          >
            {pending && <Spinner />}
            {pending
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMode((current) => (current === "login" ? "signup" : "login"))
            setError("")
          }}
          className="mt-6 text-[12px] text-[#77766f] underline decoration-[#cfcdc4] underline-offset-4 transition-colors hover:text-[#191918] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  )
}
