import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma CLI only auto-loads .env, not .env.local (Next.js convention).
// Manually load .env.local so DATABASE_URL is available for db push / migrate.
try {
  process.loadEnvFile('.env.local')
} catch {
  // .env.local is absent in CI/production — DATABASE_URL must be set in the environment
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
