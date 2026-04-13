'use client'

import { useState, useCallback } from 'react'
import { Mode, ChatMessage, MODE_CONFIGS, ApiResponse } from '@/lib/types'
import { ModeSelector } from '@/components/mode-selector'
import { ChatInput } from '@/components/chat-input'
import { ChatOutput } from '@/components/chat-output'

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<Mode>('webdev')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSend = useCallback(async (input: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      mode: selectedMode,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: selectedMode,
          input: input
        })
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
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // If API fails, generate mock structured response based on mode
      const sections = MODE_CONFIGS[selectedMode].sections
      const mockSections: Record<string, string> = {}
      
      sections.forEach((section) => {
        mockSections[section] = getMockContent(selectedMode, section, input)
      })
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        mode: selectedMode,
        sections: mockSections,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }, [selectedMode])
  
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">D</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">DevAssist AI</h1>
            </div>
            <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
          </div>
        </div>
      </header>
      
      {/* Chat Area */}
      <ChatOutput messages={messages} isLoading={isLoading} />
      
      {/* Input Area */}
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

// Mock content generator for demo purposes
function getMockContent(mode: Mode, section: string, input: string): string {
  const mockResponses: Record<Mode, Record<string, string>> = {
    webdev: {
      'Problem Understanding': `Based on your query about "${input.slice(0, 50)}...", the core issue appears to be related to component architecture or state management. Let me break this down systematically.`,
      'Root Cause': 'The underlying cause is likely improper handling of asynchronous operations or incorrect dependency management in your component lifecycle.',
      'Fix Strategy': '1. Identify all state dependencies\n2. Implement proper cleanup functions\n3. Consider using memoization for expensive computations\n4. Add error boundaries for graceful failure handling',
      'Best Practices': '• Always handle loading and error states\n• Use TypeScript for better type safety\n• Implement proper code splitting\n• Follow the principle of least privilege for data access'
    },
    sql: {
      'Tables': 'Based on your query, you will need to work with the primary table containing the main data and potentially join with related lookup tables.',
      'Joins': 'Consider using LEFT JOIN to preserve all records from the primary table while matching related data. Use INNER JOIN only when you need matching records from both tables.',
      'Filters': 'Apply WHERE clauses early in the query to reduce the dataset before joins. Use indexed columns for better performance.',
      'Aggregations': 'GROUP BY the non-aggregated columns and use appropriate aggregate functions (COUNT, SUM, AVG) based on your requirements.',
      'Optimization': '• Add appropriate indexes on frequently queried columns\n• Avoid SELECT * in production\n• Consider query caching for repeated queries\n• Use EXPLAIN ANALYZE to understand query execution'
    },
    'problem-solving': {
      'Brute Force': `For this problem, the brute force approach would involve iterating through all possible combinations. This has a time complexity of O(n²) or higher, which works for small inputs but becomes inefficient at scale.`,
      'Better Approach': 'We can improve by using a hash map to store intermediate results, reducing time complexity to O(n) with O(n) space. This trades memory for speed.',
      'Optimal Approach': 'The optimal solution uses a two-pointer technique or sliding window approach, achieving O(n) time complexity with O(1) space. This is the most efficient solution for production use.'
    }
  }
  
  return mockResponses[mode][section] || 'Analysis in progress...'
}
