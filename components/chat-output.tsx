'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage, MODE_CONFIGS } from '@/lib/types'
import { ResponseCard } from './response-card'
import { User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatOutputProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function ChatOutput({ messages, isLoading }: ChatOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Smooth scroll to bottom whenever messages change or loading state toggles
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth">
      {messages.map((message) => (
        <div key={message.id} className={cn("max-w-4xl mx-auto flex gap-4 items-start w-full", message.role === 'user' ? 'flex-row-reverse' : '')}>
          {message.role === 'user' ? (
            <>
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <div className="max-w-[85%] bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <div className="flex items-center gap-2 mt-3">
                   <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                     {MODE_CONFIGS[message.mode].label} Mode
                   </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md mt-1">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-4 max-w-[85%]">
                {message.sections && Object.entries(message.sections).map(([title, content], idx) => (
                  <ResponseCard
                    key={title}
                    title={title}
                    content={content}
                    index={idx}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="max-w-4xl mx-auto flex gap-4 items-start w-full">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md mt-1">
             <Sparkles className="w-5 h-5 text-primary-foreground fill-primary-foreground animate-pulse" />
          </div>
          <div className="flex-1 max-w-[85%]">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4 w-fit">
              <div className="flex gap-1.5 h-full items-center">
                <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-medium text-muted-foreground animate-pulse">Structuring reasoning steps...</span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible anchor for auto-scroll */}
      <div ref={bottomRef} className="h-4 w-full" />
    </div>
  )
}
