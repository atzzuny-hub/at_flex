'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = {
    error: string | null
    email: string
}

export async function login(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password')?? '')

    if(!email || !password){
        return {error : '이메일과 비밀번호를 입력해 주세요.', email}
    }

    const supabase = await createClient()
    const {error} = await supabase.auth.signInWithPassword({email, password})

    if(error){
        // 어떤 값이 틀렸는지 알려주지 않는다 (계정 존재 여부 노출 방지)
        return { error: '이메일 또는 비밀번호가 올바르지 않습니다.', email }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}