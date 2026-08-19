"use server"

import { Model } from "mongoose"

import { Answer, Question, Tag, User } from "@/database"

import action from "../handlers/action"
import handleError from "../handlers/error"
import { GlobalSearchSchema } from "../validation"

interface SearchableModel {
  type: GlobalSearchType
  // The models differ in shape, so the filter is built from `searchFields`
  // rather than from a single document type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>
  searchFields: string[]
  titleField: string
}

// Each searchable model, described once: where to look, what to show, and how
// to build the link. Adding a new searchable entity is a matter of one entry.
const searchableModels: SearchableModel[] = [
  {
    type: "question",
    model: Question,
    searchFields: ["title", "content"],
    titleField: "title",
  },
  {
    type: "answer",
    model: Answer,
    searchFields: ["content"],
    titleField: "content",
  },
  {
    type: "user",
    model: User,
    searchFields: ["name", "username", "email"],
    titleField: "name",
  },
  {
    type: "tag",
    model: Tag,
    searchFields: ["name"],
    titleField: "name",
  },
]

const RESULTS_PER_TYPE = 4
const TOTAL_RESULTS = 12

export const globalSearch = async (
  params: GlobalSearchParams,
): Promise<ActionResponse<GlobalSearchResult[]>> => {
  const validationResult = await action({
    params,
    schema: GlobalSearchSchema,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { query, type } = params

  try {
    // A type filter narrows the sweep to one model; otherwise search them all.
    const targets = type
      ? searchableModels.filter((m) => m.type === type)
      : searchableModels

    if (targets.length === 0) {
      return { success: true, data: [] }
    }

    // Escape regex metacharacters so a query like "c++" is matched literally
    // rather than blowing up as an invalid pattern.
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = { $regex: safeQuery, $options: "i" }

    // When filtered to a single type, show a fuller list instead of a preview.
    const limit = type ? TOTAL_RESULTS : RESULTS_PER_TYPE

    const grouped = await Promise.all(
      targets.map(async ({ type: resultType, model, searchFields, titleField }) => {
        const docs = await model
          .find({ $or: searchFields.map((field) => ({ [field]: regex })) })
          .select(`_id ${searchFields.join(" ")} question`)
          .limit(limit)
          .lean()

        return docs.map((doc: Record<string, unknown>) => ({
          id: String(
            // An answer links to the question that holds it, not to itself.
            resultType === "answer" ? doc.question : doc._id,
          ),
          type: resultType,
          title: String(doc[titleField] ?? "Untitled"),
        }))
      }),
    )

    return {
      success: true,
      data: JSON.parse(JSON.stringify(grouped.flat().slice(0, TOTAL_RESULTS))),
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
