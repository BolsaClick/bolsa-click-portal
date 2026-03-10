'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import UnderlineExtension from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import { useEffect } from 'react'
import EditorToolbar from './EditorToolbar'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  onImageUpload?: (file: File) => Promise<string>
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Comece a escrever seu artigo...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          loading: 'lazy',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      UnderlineExtension,
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none prose-headings:text-blue-950 prose-a:text-bolsa-primary prose-blockquote:border-bolsa-primary prose-blockquote:bg-pink-50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-img:rounded-xl',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length && onImageUpload) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            onImageUpload(file).then((url) => {
              const { tr } = view.state
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })?.pos
              if (pos !== undefined) {
                const node = view.state.schema.nodes.image.create({
                  src: url,
                  alt: file.name,
                })
                view.dispatch(tr.insert(pos, node))
              }
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items && onImageUpload) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) {
                onImageUpload(file).then((url) => {
                  editor
                    ?.chain()
                    .focus()
                    .setImage({ src: url, alt: file.name })
                    .run()
                })
              }
              return true
            }
          }
        }
        return false
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    // Only sync when content changes externally (e.g., switching to source mode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  if (!editor) return null

  return (
    <div className="rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      <div className="border border-gray-300 rounded-b-lg bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
