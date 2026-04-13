export type Mode = 'webdev' | 'sql' | 'problem-solving'

export interface ModeConfig {
  id: Mode
  label: string
  icon: string
  placeholder: string
  sections: string[]
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  webdev: {
    id: 'webdev',
    label: 'Web Dev',
    icon: 'code',
    placeholder: 'Enter your tech stack + problem...',
    sections: ['Problem Understanding', 'Root Cause', 'Fix Strategy', 'Best Practices']
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    icon: 'database',
    placeholder: 'Describe your database problem...',
    sections: ['Tables', 'Joins', 'Filters', 'Aggregations', 'Optimization']
  },
  'problem-solving': {
    id: 'problem-solving',
    label: 'Problem Solving',
    icon: 'brain',
    placeholder: 'Paste your coding problem...',
    sections: ['Brute Force', 'Better Approach', 'Optimal Approach']
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: Mode
  sections?: Record<string, string>
  timestamp: Date
}

export interface ApiResponse {
  sections: Record<string, string>
}
