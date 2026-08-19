import TagCard from "@/components/cards/TagCard"
import { Preview } from "@/components/editor/Preview"
import Metric from "@/components/Metric"
import UserAvatar from "@/components/UserAvatar"
import ROUTES from "@/constants/route"
import { getQuestion, incrementViews } from "@/lib/actions/question.action"
import { formatNumber, getTimeStamp } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
import View from "../View"
import { after } from "next/server"
import AnswerForm from "@/components/forms/AnswerForm"
import { getAnswers } from "@/lib/actions/answer.action"
import AllAnswers from "@/components/answers/AllAnswers"
import Votes from "@/components/votes/Votes"
import { Suspense, use } from "react"
import { hasVoted } from "@/lib/actions/vote.action"
import SaveQuestion from "@/components/questions/SaveQuestion"
import { hasSavedQuestion } from "@/lib/actions/collection.action"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params
  const {
    success,
    data: question,
    error,
  } = await getQuestion({ questionId: id })

  if (!success || !question) {
    return {
      title: "Question not found",
      description: "The question you are looking for does not exist.",
    }
  }

  return {
    title: question.title,
    description: question.content.slice(0, 160),
  }
}

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params
  const { page, pageSize, filter } = await searchParams

  const { success, data: question } = await getQuestion({ questionId: id })

  if (!success || !question) return redirect("/404")

  const {
    success: areAnswersLoaded,
    data: answersResult,
    error: answersError,
  } = await getAnswers({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter: filter || "popular",
  })

  const { author, createdAt, answers, views, tags, content, title } = question

  // non-blocking promise runs after first data sent to client
  after(async () => {
    await incrementViews({ questionId: id })
  })

  const hasVotedPromise = hasVoted({
    targetId: question._id,
    targetType: "question",
  })

  const hasQuestionSavedToCollection = hasSavedQuestion({
    questionId: id,
  })

  return (
    <>
      {/* Instead of calling client componet to trigger action you can also use parallel Promise.all([.,.]) to trigger actions without client which give updated UI but it is UI blocking as everything is await making SR a blocking  */}
      {/* <View questionId={id} /> */}
      {/* if you don't need immediate count UI updates then best is after() which make sure that increment happens on same server side rendering after data is sent but before request is close or done in server */}

      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              // fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex gap-3 justify-end">
            <Suspense fallback={<div>Loading...</div>}>
              <Votes
                targetType="question"
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                targetId={question._id}
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <SaveQuestion
                questionId={question._id}
                hasSavedQuestion={hasQuestionSavedToCollection}
              />
            </Suspense>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>

      <section className="my-5">
        <AllAnswers
          page={Number(page)}
          isNext={answersResult?.isNext || false}
          data={answersResult?.answers}
          success={areAnswersLoaded}
          error={answersError}
          totalAnswers={answersResult?.totalAnswers || 0}
        />
      </section>

      <section className="my-5">
        <AnswerForm
          questionId={id}
          questionTitle={title}
          questionContent={content}
        />
      </section>
    </>
  )
}

export default QuestionDetails
