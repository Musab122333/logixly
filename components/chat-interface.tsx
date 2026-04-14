'use client'

import { useState, useCallback, useEffect } from 'react'
import { ModeSelector } from '@/components/mode-selector'
import { ChatInput } from '@/components/chat-input'
import { ChatOutput } from '@/components/chat-output'
import { Sidebar } from '@/components/sidebar'
import type { Mode, ChatMessage, ApiResponse, Conversation } from '@/lib/types'

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const [selectedMode, setSelectedMode] = useState<Mode>('webdev')
  const [loading, setLoading] = useState(false)

  // Hydrate from local storage
  useEffect(() => {
    const saved = localStorage.getItem('logixly_conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Re-hydrate dates
        const hydrated = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }))
        setConversations(hydrated)
        if (hydrated.length > 0) {
          // Default to newest
          const sorted = [...hydrated].sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime());
          setActiveId(sorted[0].id)
          setSelectedMode(sorted[0].mode)
        }
      } catch (e) {
        console.error("Error loading chat history", e)
      }
    }
  }, [])

  // Sync to local storage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('logixly_conversations', JSON.stringify(conversations))
    } else {
      localStorage.removeItem('logixly_conversations')
    }
  }, [conversations])

  const activeConversation = conversations.find(c => c.id === activeId)
  const messages = activeConversation?.messages || []

  const handleNewChat = () => {
    setActiveId(null)
  }

  const handleDeleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
    }
  }

  const handleSelectChat = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) {
      setActiveId(id)
      setSelectedMode(conv.mode)
    }
  }

  const handleSend = useCallback(async (input: string) => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      mode: selectedMode,
      timestamp: new Date(),
    }

    let currentConversationId = activeId

    setConversations(prev => {
      const now = new Date()
      // If no active conversation, create one
      if (!currentConversationId) {
        currentConversationId = crypto.randomUUID()
        const newConv: Conversation = {
          id: currentConversationId,
          title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
          mode: selectedMode,
          messages: [userMessage],
          createdAt: now,
          updatedAt: now
        }
        setActiveId(currentConversationId)
        return [...prev, newConv]
      }

      // Otherwise update existing
      return prev.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: now
          }
        }
        return c
      })
    })

    setLoading(true)

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

      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date()
          }
        }
        return c
      }))
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
      setConversations(prev => prev.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date()
          }
        }
        return c
      }))
    } finally {
      setLoading(false)
    }
  }, [selectedMode, loading, activeId])

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-68px)]">
      {/* Sidebar */}
      <Sidebar 
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectChat}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col relative h-full bg-background overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-3xl space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  What are we solving today?
                </h1>
                <p className="text-lg text-muted-foreground mx-auto max-w-xl">
                  Logixly provides structured, step-by-step reasoning for technical problems. Choose your mode below.
                </p>
              </div>
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 py-3 flex justify-center items-center shadow-sm shrink-0">
              <ModeSelector selectedMode={activeConversation?.mode || selectedMode} onModeChange={(mode) => {
                 setSelectedMode(mode);
                 if (activeId) {
                   setConversations(prev => prev.map(c => 
                     c.id === activeId ? { ...c, mode } : c
                   ))
                 }
              }} />
            </div>
            <ChatOutput messages={messages} isLoading={loading} />
          </>
        )}

        <footer className="sticky bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-md p-4 shrink-0">
          <ChatInput
            selectedMode={messages.length > 0 ? activeConversation!.mode : selectedMode}
            onSend={handleSend}
            isLoading={loading}
          />
        </footer>
      </main>
    </div>
  )
}
