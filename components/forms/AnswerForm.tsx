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
import { useRef, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { MDXEditorMethods } from "@mdxeditor/editor"
import { Loader } from "lucide-react"
import Image from "next/image"
import { createAnswer } from "@/lib/actions/answer.action"

import dynamic from "next/dynamic"
import { api } from "@/lib/api"

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
})

interface Props {
  questionId: string
  questionTitle: string
  questionContent: string
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
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

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      })

      if (result.success) {
        form.reset()

        toast.success("Your answer has been posted successfully")

        if (editorRef.current) {
          editorRef.current.setMarkdown("")
        }
      } else {
        toast.error(result.error?.message)
      }
    })
  }

  const generateAIAnswer = async () => {
    if (session.status !== "authenticated")
      return toast.error("You need to be logged in to use this feature")

    setIsAISubmitting(true)
    // Formulate AI answer based on this
    const userAnswer = editorRef.current?.getMarkdown()

    try {
      const { success, error, data } = await api.ai.getAnswer(
        questionTitle,
        questionContent,
        userAnswer,
      )

      if (!success || !data) {
        return toast.error(error?.message)
      }

      const formattedAnswer = data.replace(/<br\s*\/?>/gi, "\n").trim()

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer)
        form.setValue("content", formattedAnswer)
        form.trigger("content")
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "There was a problem with your request",
      )
    } finally {
      setIsAISubmitting(false)
    }
  }
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
