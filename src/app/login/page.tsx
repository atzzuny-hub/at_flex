import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  // 이미 로그인했다면 로그인 화면을 보여주지 않는다
  if (data?.claims) redirect('/')

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <LoginForm />
    </main>
  )
}