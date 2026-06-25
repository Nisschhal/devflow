"use client"

import { Controller, useForm } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field"
import * as z from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"

import { Button } from "../ui/button"
import { toast } from "sonner"
import { AnswerSchema } from "@/lib/validation"
import Editor from "../editor"
import { useRef, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { MDXEditorMethods } from "@mdxeditor/editor"
import { Loader } from "lucide-react"
import Image from "next/image"

const AnswerForm = () => {
  const [isAnswering, startAnsweringTransition] = useTransition()
  const [isAISubmitting, setIsAISubmitting] = useState(false)
  const session = useSession()

  const editorRef = useRef<MDXEditorMethods>(null)

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: standardSchemaResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  })

  const handleSubmit = async (data: z.infer<typeof AnswerSchema>) => {
    // try {
    //   const result = (await onSubmit(data)) as ActionResponse
    //   console.log("AnswerForm handleSubmit result:", JSON.stringify(result))
    //   if (result?.success) {
    //     toast.success(
    //       formType === "SIGN_IN"
    //         ? "Sign in Successful!"
    //         : "Sign up Successful!",
    //     )

    //     router.push(ROUTES.HOME)
    //   } else {
    //     toast.error(
    //       formType === "SIGN_IN" ? "Sign in Failed!" : "Sign up Failed!",
    //       { description: result?.error?.message },
    //     )
    //   }
    // } catch (error) {
    //   console.log("AnswerForm handleSubmit ERROR:", error)
    //   toast.error("Something went wrong", {
    //     description: error instanceof Error ? error.message : "Unknown error",
    //   })
    // }
    console.log("data", data)
  }

  const generateAIAnswer = () => {}

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate AI Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-6 flex w-full flex-col gap-10"
      >
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex w-full flex-col"
            >
              <FieldLabel
                htmlFor="form-rhf-demo-title"
                className="paragraph-semibold text-dark400_light800"
              >
                Detailed explanation of your problem{" "}
                <span className="text-primary-500">*</span>
              </FieldLabel>
              {/* <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                // placeholder="What is React?"
                autoComplete="off"
                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
              /> */}
              <Editor
                value={field.value}
                fieldChange={field.onChange}
                editorRef={editorRef}
              />
              <FieldDescription className="body-regular mt-2.5 text-light-500">
                Introduce the problem and expand on what you&apos;ve put in the
                title.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="primary-gradient w-fit">
            {isAnswering ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Answer"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

export default AnswerForm
