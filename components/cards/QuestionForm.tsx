"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

import { Button } from "@/components/ui/button"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import dynamic from "next/dynamic"
import { AskQuestionSchema } from "@/lib/validation"
import { forwardRef, useRef, useTransition } from "react"
import { MDXEditorMethods } from "@mdxeditor/editor"
import TagCard from "./TagCard"
import { createQuestion, updateQuestion } from "@/lib/actions/question.action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import ROUTES from "@/constants/route"
import { Circle, Loader } from "lucide-react"

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import("../editor"), {
  // Make sure we turn SSR off because MDX editor is client side so keep this as placeholder by turning ssr off
  ssr: false,
})

interface Params {
  question?: Question
  isEdit?: boolean
}

const QuestionForm = ({ question, isEdit = false }: Params) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // To pass to editor so it can be controlled via ref
  const editorRef = useRef<MDXEditorMethods>(null)

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: standardSchemaResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  })
  const handleInputkeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] },
  ) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const tagInput = e.currentTarget.value.trim()

      // check if tag is valid
      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput])
        e.currentTarget.value = ""
        form.clearErrors("tags")
        // check tags length; should be < 15
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag should be less than 15 characters!",
        })
        // check if tag already exist
      } else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          type: "manual",
          message: "Tag already exist!",
        })
      }
    }
  }

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag)
    form.setValue("tags", newTags)

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Atleast one Tags are required!",
      })
    }
  }

  const handleSubmit = async (data: z.infer<typeof AskQuestionSchema>) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await updateQuestion({
          questionId: question?._id,
          ...data,
        })

        if (result.success) {
          toast.success("Question updated successfully")

          if (result.data) router.push(ROUTES.QUESTION(result.data._id))
        } else {
          toast.error(result.error?.message || "Something went wrong")
        }

        return
      }

      const result = await createQuestion(data)
      if (result.success) {
        toast.success("Question created successfully!")
        result.data && router.push(ROUTES.QUESTION(result.data?._id))
      } else {
        toast.success("Question creation failed!")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="title"
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
                Question Title <span className="text-primary-500">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                // placeholder="What is React?"
                autoComplete="off"
                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
              />
              <FieldDescription className="body-regular mt-2.5 text-light-500">
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
        <Controller
          name="tags"
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
                Tags <span className="text-primary-500">*</span>
              </FieldLabel>
              <Input
                // {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="Add tags..."
                autoComplete="off"
                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                onKeyDown={(e) => handleInputkeyDown(e, field)}
              />
              {field.value.length > 0 && (
                <div className="flex flex-start flex-wrap gap-2.5">
                  {field.value.map((tag: string) => (
                    <TagCard
                      key={tag}
                      _id={tag}
                      name={tag}
                      compact
                      remove
                      isButton
                      handleRemove={() => handleTagRemove(tag, field)}
                    />
                  ))}
                </div>
              )}
              <FieldDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what your question is about. You
                need to press enter to add a tag.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="mt-16 flex justify-end">
        <Button type="submit" className="primary-gradient w-fit text-light-900">
          {isPending ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              <span>{isEdit ? "Updating..." : "Submitting.."}</span>
            </>
          ) : (
            <>{isEdit ? "Edit" : "Ask a Question"}</>
          )}
        </Button>
      </div>
    </form>
  )
}

export default QuestionForm
