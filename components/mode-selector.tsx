'use client'

import { Mode, MODE_CONFIGS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Code, Database, Brain } from 'lucide-react'

interface ModeSelectorProps {
  selectedMode: Mode
  onModeChange: (mode: Mode) => void
}

const icons = {
  code: Code,
  database: Database,
  brain: Brain
}

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-secondary/50 rounded-2xl">
      {Object.values(MODE_CONFIGS).map((config) => {
        const Icon = icons[config.icon as keyof typeof icons]
        const isActive = selectedMode === config.id
        
        return (
          <button
            key={config.id}
            onClick={() => onModeChange(config.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
