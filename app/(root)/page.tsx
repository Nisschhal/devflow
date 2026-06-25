import Link from "next/link"

import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/route"
import LocalSearch from "@/components/search/LocalSearch"
import HomeFilter from "@/components/filter/HomeFilter"
import QuestionCard from "@/components/cards/QuestionCard"
import dbConnect from "@/lib/mongoose"
import handleError from "@/lib/handlers/error"
import { getQuestions } from "@/lib/actions/question.action"
import DataRenderer from "@/components/DataRenderer"
import { EMPTY_QUESTION } from "@/constants/state"
import CommonFilter from "@/components/filter/CommonFilter"
import { HomePageFilters } from "@/constants/filter"

const Home = async (searchParams: Promise<PaginatedSearchParams>) => {
  const { page, pageSize, query, filter, sort } = await searchParams

  const { success, error, data } = await getQuestions({
    page: page || 1,
    pageSize: pageSize || 10,
    query: query || "",
    filter: filter || "",
    sort: sort || "",
  })

  const { questions } = data || {}

  // const filteredQuestions = questions.filter((question) => {
  //   const matchesQuery = question.title
  //     .toLowerCase()
  //     .includes(query.toLowerCase())

  //   const matchesFilter = filter
  //     ? question.tags.some(
  //         (tag) => tag.name.toLowerCase() === filter.toLowerCase(),
  //       )
  //     : true
  //   return matchesQuery && matchesFilter
  // })

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </section>
      <HomeFilter />
      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
      {/* {success ? (
        <div className="mt-10 flex w-full flex-col gap-6">
          {questions &&
            questions.length > 0 &&
            questions.map((question) => (
              <QuestionCard key={question._id.toString()} question={question} />
            ))}
        </div>
      ) : (
        <div className="mt-10 flex w-full items-center justify-center">
          <div className="text-dark400_light700">
            {error?.message || "Failed to fetched question"}
          </div>
        </div>
      )} */}
    </>
  )
}

export default Home
