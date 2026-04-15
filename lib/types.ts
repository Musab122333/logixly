export type Mode = 'webdev' | 'sql' | 'problem-solving'

export interface ModeConfig {
  id: Mode
  label: string
  icon: string
  placeholder: string
  sections: string[]
  color: string // Tailwind color class or specific hex
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  webdev: {
    id: 'webdev',
    label: 'Web Dev',
    icon: 'code',
    placeholder: 'Enter your tech stack + problem...',
    sections: ['Problem Understanding', 'Root Cause', 'Fix Strategy', 'Pseudo-Code', 'Best Practices'],
    color: 'from-blue-500 to-cyan-400'
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    icon: 'database',
    placeholder: 'Describe your database problem...',
    sections: ['Tables', 'Joins', 'Filters', 'Aggregations', 'Optimization'],
    color: 'from-violet-500 to-purple-400'
  },
  'problem-solving': {
    id: 'problem-solving',
    label: 'Problem Solving',
    icon: 'brain',
    placeholder: 'Paste your coding problem...',
    sections: ['Brute Force', 'Better Approach', 'Optimal Approach', 'Pseudo-Code'],
    color: 'from-amber-500 to-orange-400'
  }
}

export interface Attachment {
  name: string
  mimeType: string
  dataUrl: string // full data url for preview or just base64 slice
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: Mode
  attachments?: Attachment[]
  sections?: Record<string, string>
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  mode: Mode
  messages: ChatMessage[]
  updatedAt: Date
  createdAt: Date
}

export interface ApiResponse {
  sections: Record<string, string>
}
