'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ResponseCardProps {
  title: string
  content: string
  index: number
}

export function ResponseCard({ title, content, index }: ResponseCardProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-2xl p-5 shadow-md transition-all duration-300 hover:shadow-lg',
        'animate-in fade-in slide-in-from-bottom-2'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 rounded-lg hover:bg-secondary"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  )
}
