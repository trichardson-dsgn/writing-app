"use client"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Placeholder } from "@tiptap/extensions"
import { Markdown } from "@tiptap/markdown"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef } from "react"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Rich text editor (Tiptap/ProseMirror) that stores markdown. Markdown
 * shortcuts like "## ", "- ", "1. " and **bold** convert as you type;
 * Cmd+B/I/U, Cmd+Shift+7/8, Cmd+Alt+1–3 and Tab/Shift+Tab in lists work natively.
 */
export function MarkdownEditor({ value, onChange, placeholder, className }: Props) {
  const lastValue = useRef(value)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: `md-editor ${className ?? ""}`,
        "aria-label": "Document body",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown()
      lastValue.current = markdown
      onChangeRef.current(markdown)
    },
  })

  // Sync external changes (e.g. AI continuation) without clobbering edits.
  useEffect(() => {
    if (!editor || value === lastValue.current) return
    lastValue.current = value
    editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false })
  }, [editor, value])

  return <EditorContent editor={editor} />
}
