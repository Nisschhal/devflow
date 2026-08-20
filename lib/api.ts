import { IAccount } from "@/database/account.model"
import { IUser } from "@/database/user.model"

import { fetchHandler } from "./handlers/fetch"
import ROUTES from "@/constants/route"
import { APIResponse } from "@/types/api"

// These helpers call our own /api routes over HTTP, so they need an absolute
// URL when they run on the server (auth callbacks do). Falling back to
// localhost in a deployed environment makes every server-side call fail, which
// silently breaks sign-in, so derive the deployment host when it is available.
const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL)
    return process.env.NEXT_PUBLIC_API_BASE_URL

  // Vercel: the stable production domain, then the per-deployment domain.
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercelHost) return `https://${vercelHost}/api`

  // Any other host that sets an explicit auth origin (AUTH_URL/NEXTAUTH_URL).
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL
  if (authUrl) return `${authUrl.replace(/\/+$/, "").replace(/\/api$/, "")}/api`

  return "http://localhost:3000/api"
}

const API_BASE_URL = resolveBaseUrl()

export const api = {
  auth: {
    oAuthSignIn: ({
      user,
      provider,
      providerAccountId,
    }: SignInWithOAuthParams) =>
      fetchHandler(`${API_BASE_URL}/auth/${ROUTES.SIGN_IN_WITH_OAUTH}`, {
        method: "POST",
        body: JSON.stringify({ user, provider, providerAccountId }),
      }),
  },
  users: {
    getAll: () => fetchHandler(`${API_BASE_URL}/users`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/users/${id}`),
    getByEmail: (email: string) =>
      fetchHandler(`${API_BASE_URL}/users/email`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    create: (userData: Partial<IUser>) =>
      fetchHandler(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    update: (id: string, userData: Partial<IUser>) =>
      fetchHandler(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/users/${id}`, { method: "DELETE" }),
  },
  accounts: {
    getAll: () => fetchHandler(`${API_BASE_URL}/accounts`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/accounts/${id}`),
    getByProvider: (providerAccountId: string) =>
      fetchHandler(`${API_BASE_URL}/accounts/provider`, {
        method: "POST",
        body: JSON.stringify({ providerAccountId }),
      }),
    create: (accountData: Partial<IAccount>) =>
      fetchHandler(`${API_BASE_URL}/accounts`, {
        method: "POST",
        body: JSON.stringify(accountData),
      }),
    update: (id: string, accountData: Partial<IAccount>) =>
      fetchHandler(`${API_BASE_URL}/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(accountData),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/accounts/${id}`, { method: "DELETE" }),
  },
  ai: {
    getAnswer: (
      questionTitle: string,
      content: string,
      userAnswer?: string,
    ): Promise<ActionResponse<string>> =>
      fetchHandler(`${API_BASE_URL}/ai/answers`, {
        method: "POST",
        body: JSON.stringify({ questionTitle, content, userAnswer }),
      }),
  },
}
