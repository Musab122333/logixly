'use client'

import { useState, useCallback } from 'react'
import { ModeSelector } from '@/components/mode-selector'
import { ChatInput } from '@/components/chat-input'
import { ChatOutput } from '@/components/chat-output'
import type { Mode, ChatMessage, ApiResponse, MODE_CONFIGS } from '@/lib/types'

interface ChatInterfaceProps {
  userName: string
}

export function ChatInterface({ userName }: ChatInterfaceProps) {
  const [selectedMode, setSelectedMode] = useState<Mode>('webdev')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      mode: selectedMode,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode, input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data: ApiResponse = await response.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        mode: selectedMode,
        sections: data.sections,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        mode: selectedMode,
        sections: {
          'Error': 'Sorry, something went wrong. Please try again.',
        },
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }, [selectedMode, isLoading])

  return (
    <main className="flex flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-3xl space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Hi {userName}, how can I help?
              </h1>
              <p className="text-muted-foreground">
                Select a mode and describe your problem for structured guidance
              </p>
            </div>
            <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-border bg-card/50 px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>
          </div>
          <ChatOutput messages={messages} isLoading={isLoading} />
        </>
      )}

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <ChatInput
          selectedMode={selectedMode}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </footer>
    </main>
  )
}
