"use client"
import { Button } from "../ui/button"
import Image from "next/image"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"

const SocialAuthForm = () => {
  const session = useSession()
  console.log("Session from useSession() from SocialAuthForm:", session) // Log the session from useSession() for debugging

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        redirectTo: "/",
      })
    } catch (error) {
      console.error("Social login error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to login. Please try again.",
      )
    }
  }
  const buttonClass =
    " background-dark400_light900 body-medium rounded-2 text-dark200_light800 min-h-12 flex-1 px-4 py-3.5"
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button
        className={buttonClass}
        onClick={() => handleSocialLogin("github")}
      >
        <Image
          src="/icons/github.svg"
          alt="GitHub"
          width={20}
          height={20}
          className="invert-colors"
        />
        <span>Login with GitHub</span>
      </Button>
      {/* Google sign-in is disabled until AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
          are set and the Google provider is re-enabled in auth.ts.
      <Button
        className={buttonClass}
        onClick={() => handleSocialLogin("google")}
      >
        <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
        <span>Login with Google</span>
      </Button>
      */}
    </div>
  )
}

export default SocialAuthForm
