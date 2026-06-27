"use server"

import mongoose, { type QueryFilter } from "mongoose"

import TagQuestion from "@/database/tag-question.model"
import Tag, { ITagDoc } from "@/database/tag.model"

import action from "../handlers/action"
import handleError from "../handlers/error"
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validation"
import Question, { IQuestionDoc } from "@/database/question.model"
import { revalidatePath } from "next/cache"
import ROUTES from "@/constants/route"
import dbConnect from "../mongoose"

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { title, content, tags } = validationResult.params!
  const userId = validationResult?.session?.user?.id

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session },
    )

    if (!question) {
      throw new Error("Failed to create question")
    }

    const tagIds: mongoose.Types.ObjectId[] = []
    const tagQuestionDocuments = []

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session },
      )

      tagIds.push(existingTag._id)
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      })
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session })

    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session },
    )

    await session.commitTransaction()

    return { success: true, data: JSON.parse(JSON.stringify(question)) }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    session.endSession()
  }
}
export async function updateQuestion(
  params: UpdateQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { title, content, tags, questionId } = validationResult.params!
  const userId = validationResult?.session?.user?.id

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const question = await Question.findById(questionId).populate("tags")

    if (!question) {
      throw new Error("Failed to create question")
    }

    if (question.author.toString() !== userId) throw new Error("Unauthorized")

    if (question.title !== title || question.content !== content) {
      question.title = title
      question.content = content
    }

    const populatedTags = question.tags as unknown as ITagDoc[]

    const existingTagNames = populatedTags.map((t) => t.name.toLowerCase())

    const tagToAdd = tags.filter(
      (tag) => !existingTagNames.includes(tag.toLowerCase()),
    )

    const tagsToRemove = populatedTags.filter(
      (t) =>
        !tags.map((tag) => tag.toLowerCase()).includes(t.name.toLowerCase()),
    )

    const newTagDocuments = []

    if (tagToAdd.length > 0) {
      for (const tag of tagToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session },
        )

        newTagDocuments.push({
          tag: existingTag._id,
          question: question._id,
        })
        question.tags.push(existingTag._id)
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((t) => t._id)

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session },
      )

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: question._id },
        { session },
      )

      question.tags = populatedTags.filter(
        (t) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(t._id),
          ),
      ) as unknown as mongoose.Types.ObjectId[]
    }
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session })
    }

    await question.save({ session })
    await session.commitTransaction()

    return { success: true, data: JSON.parse(JSON.stringify(question)) }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    session.endSession()
  }
}

export async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { questionId } = validationResult.params!

  try {
    const question = await Question.findById(questionId)
      .populate("tags")
      .populate("author", "_id name image")

    if (!question) {
      throw new Error("Question not found")
    }

    return { success: true, data: JSON.parse(JSON.stringify(question)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getQuestions(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  })
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }
  const { page = 1, pageSize = 10, query, filter, sort } = params
  const skip = Number(page - 1) * pageSize // -1 means current page leave that but remove before that if page is 4 then 4-1=3 remove 3 pages before where each page has 10 items
  const limit = Number(pageSize) // number of items per page

  const queryFilter: QueryFilter<IQuestionDoc> = {}

  // TODO: recommendation system
  if (filter === "recommended")
    return { success: true, data: { questions: [], isNext: false } }

  if (query) {
    queryFilter.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ]
  }

  let sortCriteria = {}

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 }
      break
    case "unanswered":
      queryFilter.answers = 0
      sortCriteria = { createdAt: -1 }
    case "popular":
      sortCriteria = { upvotes: -1 }
      break
    default:
      sortCriteria = { createdAt: -1 }
      break
  }

  try {
    const totalQuestion = await Question.countDocuments(queryFilter)
    const questions = await Question.find(queryFilter)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)

    const isNext = totalQuestion > skip + questions.length // skip + question.lenght means not doing -1 // or include that -1 which is current page total question length

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function incrementViews(
  params: IncrementViewsParams,
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { questionId } = validationResult.params!

  try {
    const question = await Question.findById(questionId)

    if (!question) {
      throw new Error("Question not found")
    }

    question.views += 1

    await question.save()

    revalidatePath(ROUTES.QUESTION(questionId))

    return {
      success: true,
      data: { views: question.views },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await dbConnect()
    const questions = await Question.find()
      .sort({ views: -1, upvotes: -1 })
      .limit(5)

    return { success: true, data: JSON.parse(JSON.stringify(questions)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
