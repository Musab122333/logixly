'use client'

import { ChatMessage, MODE_CONFIGS } from '@/lib/types'
import { ResponseCard } from './response-card'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatOutputProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function ChatOutput({ messages, isLoading }: ChatOutputProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            DevAssist AI
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Select a mode above and describe your problem. I&apos;ll provide structured approaches
            instead of direct code, helping you understand the reasoning behind solutions.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="max-w-3xl mx-auto">
          {message.role === 'user' ? (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 bg-secondary/50 rounded-2xl px-4 py-3">
                <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {MODE_CONFIGS[message.mode].label} Mode
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                {message.sections && Object.entries(message.sections).map(([title, content], idx) => (
                  <ResponseCard
                    key={title}
                    title={title}
                    content={content}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing your problem...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
