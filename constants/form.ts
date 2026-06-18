export const AUTH_LABELS = {
  SIGN_IN: { default: "Sign In", loading: "Signing In..." },
  SIGN_UP: { default: "Sign Up", loading: "Signing Up..." },
} as const

export type FormType = keyof typeof AUTH_LABELS

export const FIELD_VALUES: Record<string, string> = {
  email: "john@gmail.com",
  password: "******",
  name: "John Doe",
  username: "johndoe99",
}
