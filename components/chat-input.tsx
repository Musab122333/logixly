'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { Mode, MODE_CONFIGS, Attachment } from '@/lib/types'
import { Send, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface ChatInputProps {
  selectedMode: Mode
  onSend: (message: string, attachments?: Attachment[]) => void
  isLoading: boolean
}

export function ChatInput({ selectedMode, onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const placeholder = MODE_CONFIGS[selectedMode].placeholder
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])
  
  const handleSubmit = () => {
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined)
      setInput('')
      setAttachments([])
    }
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setAttachments(prev => [...prev, {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            dataUrl: event.target!.result as string
          }])
        }
      }
      reader.readAsDataURL(file)
      // reset input value so the same file can be selected again if removed
      e.target.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }
  
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-2">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full border border-border shadow-sm">
                <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                <button 
                   onClick={() => removeAttachment(i)}
                   className="text-muted-foreground hover:text-foreground transition-colors ml-1 focus:outline-none"
                   title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
      )}
      <div className="relative flex items-end bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-2 pl-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,text/*,.pdf,.csv,.json,.md,.tsx,.ts,.js,.jsx,.css,.html"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[56px] max-h-[200px]"
        />
        <div className="p-2 pr-3">
          <Button
            onClick={handleSubmit}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            size="icon"
            className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  )
}
