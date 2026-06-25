import TagCard from "@/components/cards/TagCard"
import DataRenderer from "@/components/DataRenderer"
import LocalSearch from "@/components/search/LocalSearch"
import ROUTES from "@/constants/route"
import { EMPTY_TAGS } from "@/constants/state"
import { getTags } from "@/lib/actions/tag.action"

const TagPage = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams

  const { success, data, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  })
  const { tags } = data || {}

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
          iconPosition="left"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={tags}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />
    </>
  )
}

export default TagPage
