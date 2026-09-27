'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: LoginState = { error: null, email: '' }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>회사 계정으로 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
              />
            </Field>
            <Field data-invalid={!!state.error}>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!state.error}
                required
              />
              {state.error && <FieldError>{state.error}</FieldError>}
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? '로그인 중…' : '로그인'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}