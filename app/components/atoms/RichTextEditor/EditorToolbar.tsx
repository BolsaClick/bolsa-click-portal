'use client'

import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  ImageIcon,
  Youtube,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
} from 'lucide-react'
import { useCallback, useState } from 'react'

interface EditorToolbarProps {
  editor: Editor
  onImageUpload?: (file: File) => Promise<string>
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-50 text-bolsa-primary'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}

export default function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const iconSize = 16

  const handleLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl, target: '_blank' })
          .run()
      }
      setShowLinkInput(false)
      setLinkUrl('')
    } else {
      const previousUrl = editor.getAttributes('link').href || ''
      setLinkUrl(previousUrl)
      setShowLinkInput(true)
    }
  }, [editor, showLinkInput, linkUrl])

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().unsetLink().run()
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor])

  const handleImageUploadClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/gif,image/webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !onImageUpload) return
      try {
        const url = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url, alt: file.name }).run()
      } catch {
        // handled by parent
      }
    }
    input.click()
  }, [editor, onImageUpload])

  const handleYoutube = useCallback(() => {
    const url = window.prompt('Cole a URL do vídeo do YouTube:')
    if (url) {
      editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 })
    }
  }, [editor])

  return (
    <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
      {/* Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrito"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Itálico"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Sublinhado"
      >
        <Underline size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Título H2"
      >
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Título H3"
      >
        <Heading3 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive('heading', { level: 4 })}
        title="Título H4"
      >
        <Heading4 size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Lista"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Citação"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Bloco de código"
      >
        <Code2 size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Insert */}
      <ToolbarButton onClick={handleLink} active={editor.isActive('link')} title="Link">
        <LinkIcon size={iconSize} />
      </ToolbarButton>
      {onImageUpload && (
        <ToolbarButton onClick={handleImageUploadClick} title="Imagem">
          <ImageIcon size={iconSize} />
        </ToolbarButton>
      )}
      <ToolbarButton onClick={handleYoutube} title="YouTube">
        <Youtube size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinhar à esquerda"
      >
        <AlignLeft size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centralizar"
      >
        <AlignCenter size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinhar à direita"
      >
        <AlignRight size={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer"
      >
        <Undo2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer"
      >
        <Redo2 size={iconSize} />
      </ToolbarButton>

      {/* Link URL input popover */}
      {showLinkInput && (
        <div className="basis-full flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-200">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-bolsa-primary focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLink()
              if (e.key === 'Escape') {
                setShowLinkInput(false)
                setLinkUrl('')
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleLink}
            className="px-3 py-1 text-xs font-medium bg-bolsa-primary text-white rounded hover:opacity-90"
          >
            Aplicar
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={handleRemoveLink}
              className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remover
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false)
              setLinkUrl('')
            }}
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
