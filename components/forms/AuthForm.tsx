"use client"

/**
 * MASTERING THE IMPORTS:
 * FieldValues: The base "shape" of any form (an object of keys/values).
 * DefaultValues<T>: Ensures the starting values are the perfect "Initial State" for shape T.
 * Path<T>: The "Address System." It creates a list of every valid field name in shape T.
 */
import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import * as z from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { AUTH_LABELS, FIELD_VALUES, type FormType } from "@/constants/form"
import { Button } from "../ui/button"
import ROUTES from "@/constants/route"
import Link from "next/link"

/**
 * 1. THE GENERIC INTERFACE (The Job Description)
 *
 * WORKER ANALOGY: This is the HR Document. It says:
 * "To do this job, the candidate (T) MUST have a driver's license (extends FieldValues)."
 * FieldValues means T is guaranteed to be an Object { key: value }.
 */
interface AuthFormProps<T extends FieldValues> {
  // THE BLUEPRINT: This schema (Zod Machine) must produce data that fits the shape of T.
  // We specify it here so we can "capture" the rules and pass them to the resolver later.
  schema: z.ZodType<T>

  // THE STARTING DATA: The actual object we start with.
  defaultValues: T

  // THE RESULT: A function that takes the finished data (T) and sends it to the server.
  onSubmit: (data: T) => Promise<{ success: boolean }>

  // THE SETTINGS: Tells the form if we are in "SIGN_IN" or "SIGN_UP" mode.
  formType: FormType
}

/**
 * 2. THE COMPONENT (The Worker)
 *
 * WORKER ANALOGY: The component is the person actually doing the work.
 * We write <T extends FieldValues> here AGAIN because the Worker must prove
 * they match the Job Description. It tells TypeScript: "I am bringing a candidate (T),
 * and I confirm they have the license (FieldValues) required to do this job."
 *
 * Because we know T is an object, we are allowed to use Object.keys() inside.
 */
const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formType,
}: AuthFormProps<T>) => {
  /**
   * 3. INITIALIZING THE ENGINE (useForm)
   *
   * WHAT IS DefaultValues<T>?
   * It is the "Initial State" protector. It ensures that if T is {email, password},
   * your starting data isn't missing a field.
   *
   * WHAT IS THE RESOLVER?
   * This is the "Runtime Police." While schema defines the rules (ZodType<T>),
   * the resolver actually RUNS those rules against the user's typing in the browser.
   */
  const form = useForm<T>({
    resolver: standardSchemaResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  })

  /**
   * 4. THE SUBMIT BRIDGE
   * SubmitHandler<T> ensures the 'data' we get at the end is the exact shape T.
   */
  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data)
  }

  // Lookup the correct button text based on 'formType' and 'isSubmitting' state.
  const buttonText = form.formState.isSubmitting
    ? AUTH_LABELS[formType].loading
    : AUTH_LABELS[formType].default

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6 mt-10" // SEMANTIC: Provides vertical breathing room
    >
      {/**
       * 5. THE DYNAMIC LOOP (Self-Building Inputs)
       * We take the "Initial Order" (defaultValues) and build one input for each item.
       */}
      {Object.keys(defaultValues).map((field) => (
        <FieldGroup key={field}>
          <Controller
            /**
             * WHAT IS Path<T>? (The Address Map)
             * If T is { user: { email: string } }, Path<T> is "user" | "user.email".
             *
             * WHY 'as Path<T>'? (The Trust Bridge)
             * Object.keys() only knows it's a "string". React Hook Form is strict;
             * it won't take a "random string." By casting 'as Path<T>', we tell TS:
             * "Trust me, this string is a valid address/key inside our object T."
             */
            name={field as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2.5">
                {/* SEMANTIC HTML: Label 'htmlFor' must match Input 'id' */}
                <FieldLabel
                  htmlFor={field.name}
                  className="paragraph-medium text-dark400_light700 capitalize"
                >
                  {field.name}
                </FieldLabel>

                <Input
                  {...field} // Spreads RHF logic: value, onChange, onBlur
                  id={field.name}
                  aria-invalid={fieldState.invalid} // Accessibility for screen readers
                  /* 
                    DYNAMIC PLACEHOLDER: 
                    We look up the field name in our 'FIELD_VALUES' menu.
                    Example: if name is "email", it finds "john@gmail.com".
                  */
                  placeholder={
                    FIELD_VALUES[field.name as keyof typeof FIELD_VALUES] ||
                    "Enter value..."
                  }
                  autoComplete="off"
                  /* SECURITY: Automatically masks text if the field name is "password" */
                  type={field.name === "password" ? "password" : "text"}
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />

                {/* ERROR DISPLAY: Only shows if the Resolver/Zod finds a mistake */}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      ))}

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
      >
        {buttonText}
      </Button>

      {/* FOOTER NAVIGATION: Conditional rendering based on formType */}
      {formType === "SIGN_IN" ? (
        <p>
          Don't have an account?{" "}
          <Link
            href={ROUTES.SIGN_UP}
            className="paragraph-semibold primary-text-gradient"
          >
            Sign up
          </Link>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <Link
            href={ROUTES.SIGN_IN}
            className="paragraph-semibold primary-text-gradient"
          >
            Sign in
          </Link>
        </p>
      )}
    </form>
  )
}

export default AuthForm
