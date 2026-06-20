import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

import { IAccountDoc } from "./database/account.model"
import { api } from "./lib/api"
import { ActionResponse } from "./types/global"
import { SignInSchema } from "./lib/validation"
import { IUserDoc } from "./database/user.model"
import bcrypt from "bcryptjs"

// NextAuth gives us 4 things:
// - handlers: GET & POST route handlers for /api/auth/* (sign-in pages, callbacks, etc.)
// - signIn: function to trigger sign-in (used in buttons/forms)
// - signOut: function to trigger sign-out
// - auth: function to get the current session (used in server components/API routes)
export const { handlers, signIn, signOut, auth } = NextAuth({
  // The OAuth providers we support — GitHub and Google
  // Users click "Sign in with GitHub/Google" → redirected to provider → provider sends user data back
  providers: [
    GitHub,
    Google,

    // ============================
    // CREDENTIALS PROVIDER — Email/Password Login
    // ============================
    // Unlike GitHub/Google which handle auth externally, Credentials lets users
    // sign in with email + password that WE store in our own database.
    // NextAuth calls authorize() when a user submits the sign-in form.
    // It must return a User object if valid, or null to deny sign-in.
    Credentials({
      async authorize(credentials) {
        // Step 1: Validate the incoming credentials (email & password) with Zod
        // credentials = whatever the user typed in the sign-in form
        // safeParse doesn't throw — it returns { success, data, error }
        const validatedFields = SignInSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          // Step 2: Look up the Account by email
          // For credentials auth, the "providerAccountId" is the user's email
          // (unlike OAuth where it's a provider-specific ID like "12345678")
          // This finds the Account document that stores the hashed password
          const { data: existingAccount } = (await api.accounts.getByProvider(
            email,
          )) as ActionResponse<IAccountDoc>

          // No account found with this email — deny sign-in
          // This means the user hasn't registered yet
          if (!existingAccount) return null

          // Step 3: Look up the actual User document using the userId from the Account
          // Account stores: { userId, provider, password, ... }
          // User stores: { name, email, image, ... }
          // They're separate because one User can have multiple Accounts
          // (e.g., same user signed up with email AND linked GitHub)
          const { data: existingUser } = (await api.users.getById(
            existingAccount.userId.toString(),
          )) as ActionResponse<IUserDoc>

          // User document doesn't exist (shouldn't happen, but safety check)
          if (!existingUser) return null

          // Step 4: Compare the password the user typed with the hashed password in DB
          // bcrypt.compare("mypassword", "$2a$10$hashedversion...")
          // It hashes the input and checks if it matches — never stores plain text
          // The "!" on password means we trust it exists (credentials accounts must have one)
          const isValidPassword = await bcrypt.compare(
            password,
            existingAccount.password!,
          )

          // Step 5: If password matches, return the user object
          // NextAuth uses this returned object to create the JWT token
          // id MUST be a string (not MongoDB ObjectId), so we call .toString()
          // This object becomes the "user" in the signIn callback and populates the JWT
          if (isValidPassword) {
            return {
              id: existingUser._id.toString(),
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            }
          }
        }

        // If we reach here, either:
        // - Validation failed (bad email/password format)
        // - Password didn't match
        return null
      },
    }),
  ],

  // Callbacks are functions that run at specific points during the auth flow
  // They run in this order on first sign-in: signIn → jwt → session
  callbacks: {
    // ============================
    // STEP 1: signIn callback
    // ============================
    // WHEN: Runs ONCE when a user tries to sign in (after provider returns user data)
    // PURPOSE: Decide whether to ALLOW or DENY the sign-in, and save user to our database
    // RETURNS: true = allow sign-in, false = deny sign-in
    async signIn({ user, profile, account }) {
      console.log("user, profile, account from signIn--------------------", {
        user,
        profile,
        account,
      })
      // If someone is logging in with email/password (credentials), just let them through
      // (credentials auth is handled differently, not via OAuth)
      if (account?.type === "credentials") return true

      // If we didn't get account or user data from the provider, something went wrong — deny
      if (!account || !user) return false

      // Build a user info object from what the OAuth provider gave us
      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        // For GitHub: use their GitHub username (profile.login = "octocat")
        // For Google: just lowercase their display name (no username concept in Google)
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : (user.name?.toLowerCase() as string),
      }

      // Call our own API to save/update the user and account in MongoDB
      // This hits POST /api/auth/signin-with-oauth which:
      //   1. Validates the data with Zod
      //   2. Creates a new User in DB (or updates name/image if they already exist)
      //   3. Creates a new Account in DB (links the User to this OAuth provider)
      //   All inside a MongoDB transaction (all-or-nothing)
      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId,
      })) as ActionResponse

      // If saving to DB failed, deny the sign-in
      if (!success) return false

      // Everything worked — allow the sign-in to proceed
      return true
    },

    // ============================
    // STEP 2: jwt callback
    // ============================
    // WHEN: Runs EVERY TIME a JWT token is created or accessed
    //   - First sign-in: account object IS present (we can look up the user)
    //   - Every subsequent request: account is undefined (token already has the user ID)
    // PURPOSE: Attach our MongoDB user ID to the token so we know WHO this user is
    async jwt({ token, account }) {
      console.log("user, profile, account from jwt", { token, account })

      // "account" only exists during the FIRST sign-in
      // On every later request, this block is skipped — the token already has sub set
      if (account) {
        // Look up the Account in our MongoDB by the provider's account ID
        // This finds the Account document we created in the signIn callback above
        const { data: existingAccount, success } =
          (await api.accounts.getByProvider(
            account.type === "credentials"
              ? token.email! // For credentials: look up by email
              : account.providerAccountId, // For OAuth: look up by provider's ID
          )) as ActionResponse<IAccountDoc>

        // If we couldn't find the account, just return the token as-is (no user ID)
        if (!success || !existingAccount) return token

        // Get the MongoDB User _id from the Account document
        const userId = existingAccount.userId

        // Store the MongoDB user ID in token.sub (sub = "subject" = who this token belongs to)
        // This is the KEY step — it connects the OAuth identity to our database user
        if (userId) token.sub = userId.toString()
      }

      // Return the token (with or without the user ID)
      // On subsequent requests, token.sub already has the user ID from the first sign-in
      return token
    },

    // ============================
    // STEP 3: session callback
    // ============================
    // WHEN: Runs every time someone reads the session (auth() or useSession())
    // PURPOSE: Pick what data from the JWT to expose to the app
    // The JWT has internal stuff we don't want to leak — this filters it
    async session({ session, token }) {
      console.log("user, profile, account from session", { session, token })

      // Take the MongoDB user ID from the JWT (token.sub) and put it on session.user.id
      // Now anywhere in the app, you can do:
      //   const session = await auth()
      //   session.user.id  ← this is the MongoDB _id
      session.user.id = token.sub as string
      return session
    },
  },
})
