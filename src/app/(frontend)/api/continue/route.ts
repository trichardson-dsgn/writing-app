const MAX_INPUT_LENGTH = 16_000

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}

function getOpenAIError(status: number) {
  if (status === 400)
    return "OpenAI rejected the continuation request configuration."
  if (status === 401)
    return "OpenAI rejected the API key. Update the AI secret and try again."
  if (status === 403) return "This OpenAI project does not allow that request."
  if (status === 404) return "The configured OpenAI model is not available."
  if (status === 429)
    return "The OpenAI project has no available quota right now."
  if (status === 520)
    return "This environment cannot reach the OpenAI API origin."
  if (status >= 500)
    return "OpenAI is temporarily unavailable. Try again in a moment."

  return "The continuation could not be generated. Try again."
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Send a valid JSON request." }, {
      status: 400,
    })
  }

  const content =
    typeof body === "object" &&
    body !== null &&
    "content" in body &&
    typeof body.content === "string"
      ? body.content.trim()
      : ""

  const instruction =
    typeof body === "object" &&
    body !== null &&
    "instruction" in body &&
    typeof body.instruction === "string"
      ? body.instruction.trim().slice(0, 500)
      : ""

  if (!content) {
    return Response.json({ error: "Write something first." }, { status: 400 })
  }

  if (content.length > MAX_INPUT_LENGTH) {
    return Response.json(
      { error: "This draft is too long for a single continuation." },
      { status: 400 },
    )
  }

  const configuredBaseURL = process.env.OPENAI_BASE_URL
  const baseURL = (configuredBaseURL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  )
  const apiKey =
    process.env.WRITING_APP_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    (configuredBaseURL ? process.env.MCP_PROXY_AUTH_TOKEN : undefined)
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini"

  if (!apiKey) {
    return Response.json(
      {
        error:
          "AI credentials have not reached this preview yet. Restart the preview and try again.",
      },
      { status: 503 },
    )
  }

  try {
    const response = await fetch(`${baseURL}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: instruction
          ? `You are an assistant inside a minimal notes app. Follow the user's instruction using the note as context. Return only the text to add to the note, with no preamble or commentary. Instruction: ${instruction}`
          : "Continue the draft naturally in the writer’s existing voice. Return only one concise continuation, with no preamble, quotation marks, or commentary.",
        input: content,
        max_output_tokens: instruction ? 600 : 240,
      }),
    })

    if (!response.ok) {
      return Response.json({ error: getOpenAIError(response.status) }, {
        status: 502,
      })
    }

    const data = (await response.json()) as OpenAIResponse
    const continuation = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")
      ?.text?.trim()

    if (!continuation) {
      return Response.json(
        { error: "OpenAI returned an empty continuation." },
        { status: 502 },
      )
    }

    return Response.json({ continuation })
  } catch {
    return Response.json(
      { error: "The continuation service is temporarily unavailable." },
      { status: 502 },
    )
  }
}
