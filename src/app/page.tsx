import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from './login/actions'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  // proxy가 이미 막아주지만, 페이지에서도 한 번 더 확인한다
  if (!data?.claims) redirect('/login')

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <p>
        로그인한 사용자: <strong>{data.claims.email}</strong>
      </p>
      <form action={logout}>
        <Button type="submit" variant="outline">
          로그아웃
        </Button>
      </form>
    </main>
  )
}