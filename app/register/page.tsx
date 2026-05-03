import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mb-6 text-sm text-gray-500">
          Already have one?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
        <RegisterForm />
      </div>
    </main>
  )
}
