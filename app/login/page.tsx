import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ registered?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const registered = params.registered === '1'
  const oauthError = params.error ?? null

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">
          New here?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
        <LoginForm registered={registered} oauthError={oauthError} />
      </div>
    </main>
  )
}
