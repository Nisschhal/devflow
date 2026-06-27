"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { formUrlQuery } from "@/lib/url"
import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import { ChevronRightIcon } from "lucide-react"

interface Props {
  page: number | undefined | string
  isNext: boolean | undefined
  containerClasses?: string
}

const Pagination = ({ page = 1, isNext = false, containerClasses }: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageNumber = Number(page) || 1

  const handleNavigation = (type: "prev" | "next") => {
    const nextPageNumber = type === "prev" ? pageNumber - 1 : pageNumber + 1

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    })

    router.push(newUrl)
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 mt-5",
        containerClasses,
      )}
    >
      {/* Previous Page Button */}
      {pageNumber > 1 && (
        <Button
          onClick={() => handleNavigation("prev")}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Prev</p>
        </Button>
      )}

      <div className="flex items-center justify-center gap-1">
        <div className="rounded-md bg-primary-500 px-3.5 py-2">
          <p className="body-semibold text-light-900">{pageNumber}</p>
        </div>
        {!isNext && (
          <p className="body-semibold text-dark-100/30 dark:text-white/50">
            of {pageNumber}
          </p>
        )}
      </div>

      {/* Next Page Button */}
      {isNext && (
        <Button
          onClick={() => handleNavigation("next")}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Next</p>
        </Button>
      )}
    </div>
  )
}

export default Pagination
