import { ChatInterface } from '@/components/chat-interface'
import { UserHeader } from '@/components/user-header'

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <UserHeader />
      <ChatInterface />
    </div>
  )
}
