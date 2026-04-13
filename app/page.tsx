import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat-interface'
import { UserHeader } from '@/components/user-header'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userName = user.user_metadata?.name || 'User'
  const userEmail = user.email || ''

  return (
    <div className="flex min-h-screen flex-col">
      <UserHeader userName={userName} userEmail={userEmail} />
      <ChatInterface userName={userName} />
    </div>
  )
}
