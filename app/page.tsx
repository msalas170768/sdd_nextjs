import Link from 'next/link'
import { FileText, Users, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Manage Invoices',
    description: 'Create, update, and track invoices in one place.',
  },
  {
    icon: Users,
    title: 'Team-Ready',
    description: 'Multi-user support with per-account invoice history.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Default',
    description: 'Sign in with your existing Google or GitHub account.',
  },
]

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300 ring-1 ring-indigo-500/30">
            Invoice Dashboard
          </span>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Invoicing made{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              simple
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Create, manage, and track invoices with ease. Secure sign-in, real-time status
            tracking, and a clean interface built for professionals.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white/10 px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything you need
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 rounded-xl bg-indigo-50 p-3">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
