"use server"

import mongoose from "mongoose"
import { revalidatePath } from "next/cache"
import { after } from "next/server"

import ROUTES from "@/constants/route"
import { Collection, Question, Tag, TagQuestion, Vote } from "@/database"
import Answer, { IAnswerDoc } from "@/database/answer.model"

import action from "../handlers/action"
import handleError from "../handlers/error"
import {
  AnswerServerSchema,
  DeleteAnswerSchema,
  DeleteQuestionSchema,
  GetAnswersSchema,
} from "../validation"
import { createInteraction } from "./interaction.action"
import dbConnect from "../mongoose"

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { content, questionId } = validationResult.params!
  const userId = validationResult.session?.user?.id

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // check if the question exists
    const question = await Question.findById(questionId)
    if (!question) throw new Error("Question not found")

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session },
    )

    if (!newAnswer) throw new Error("Failed to create the answer")

    // update the question answers count
    question.answers += 1
    await question.save({ session })

    // log the interaction
    after(async () => {
      await createInteraction({
        action: "post",
        actionId: newAnswer._id.toString(),
        actionTarget: "answer",
        authorId: userId as string,
      })
    })

    await session.commitTransaction()

    revalidatePath(ROUTES.QUESTION(questionId))

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: Answer[]
    isNext: boolean
    totalAnswers: number
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { questionId, page = 1, pageSize = 10, filter } = params

  const skip = (Number(page) - 1) * pageSize
  const limit = pageSize

  let sortCriteria = {}

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 }
      break
    case "oldest":
      sortCriteria = { createdAt: 1 }
      break
    case "popular":
      sortCriteria = { upvotes: -1 }
      break
    default:
      sortCriteria = { createdAt: -1 }
      break
  }

  try {
    const totalAnswers = await Answer.countDocuments({ question: questionId })

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id name image")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)

    const isNext = totalAnswers > skip + answers.length

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswers,
      },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { answerId } = validationResult.params!
  const { user } = validationResult.session!

  try {
    const answer = await Answer.findById(answerId)
    if (!answer) throw new Error("Answer not found")

    if (answer.author.toString() !== user?.id)
      throw new Error("You're not allowed to delete this answer")

    // reduce the question answers count
    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true },
    )

    // delete votes associated with answer
    await Vote.deleteMany({ actionId: answerId, actionType: "answer" })

    // delete the answer
    await Answer.findByIdAndDelete(answerId)

    // log the interaction
    after(async () => {
      await createInteraction({
        action: "delete",
        actionId: answerId,
        actionTarget: "answer",
        authorId: user?.id as string,
      })
    })

    revalidatePath(`/profile/${user?.id}`)

    return { success: true }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { questionId } = validationResult.params!
  const { user } = validationResult.session!

  // Create a Mongoose Session
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const question = await Question.findById(questionId).session(session)
    if (!question) throw new Error("Question not found")

    if (question.author.toString() !== user?.id)
      throw new Error("You are not authorized to delete this question")

    // Delete references from collection
    await Collection.deleteMany({ question: questionId }).session(session)

    // Delete references from TagQuestion collection
    await TagQuestion.deleteMany({ question: questionId }).session(session)

    // For all tags of Question, find them and reduce their count
    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session },
      )
    }

    // Remove all votes of the question
    await Vote.deleteMany({
      actionId: questionId,
      actionType: "question",
    }).session(session)

    // Remove all answers and their votes of the question
    const answers = await Answer.find({ question: questionId }).session(session)

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session)

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer.id) },
        actionType: "answer",
      }).session(session)
    }

    // Delete question
    await Question.findByIdAndDelete(questionId).session(session)

    // Commit transaction
    await session.commitTransaction()
    session.endSession()

    // Revalidate to reflect immediate changes on UI
    revalidatePath(`/profile/${user?.id}`)

    return { success: true }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    return handleError(error) as ErrorResponse
  }
}
