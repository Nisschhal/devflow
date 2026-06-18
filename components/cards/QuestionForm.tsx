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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

const askQuestionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string(),
  tags: z.array(z.string()),
})

const QuestionForm = () => {
  const form = useForm<z.infer<typeof askQuestionSchema>>({
    resolver: standardSchemaResolver(askQuestionSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  })

  const handleSubmit = (data: z.infer<typeof askQuestionSchema>) => {}
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
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                // placeholder="What is React?"
                autoComplete="off"
                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
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
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="Add tags..."
                autoComplete="off"
                className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
              />
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
          Ask A Question
        </Button>
      </div>
    </form>
  )
}

export default QuestionForm
