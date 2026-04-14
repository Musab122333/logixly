'use client'

import { Plus, MessageSquare, Trash2, Code, Database, Brain } from 'lucide-react'
import { Conversation, Mode, MODE_CONFIGS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

const icons: Record<Mode, any> = {
  webdev: Code,
  sql: Database,
  'problem-solving': Brain
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  // Sort by updatedAt descending
  const sorted = [...conversations].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="w-64 h-full border-r border-border bg-card/30 flex flex-col hidden md:flex">
      <div className="p-4 border-b border-border/50">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No past conversations
          </div>
        ) : (
          sorted.map((conv) => {
            const Icon = icons[conv.mode]
            const config = MODE_CONFIGS[conv.mode]
            const isActive = activeId === conv.id
            
            return (
              <div
                key={conv.id}
                className={cn(
                  "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer",
                  isActive 
                    ? `bg-secondary text-foreground` 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                onClick={() => onSelect(conv.id)}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{conv.title}</p>
                  <p className="text-xs opacity-60 truncate gap-1 flex items-center">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                {isActive && (
                  <div 
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm("Delete this conversation?")) onDelete(conv.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
