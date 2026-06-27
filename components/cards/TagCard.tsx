import ROUTES from "@/constants/route"
import Link from "next/link"
import React from "react"
import { Badge } from "../ui/badge"
import { cn, getDeviconClassName, getTechDescription } from "@/lib/utils"
import Image from "next/image"

interface Props {
  _id: string
  name: string
  questions?: number
  showCount?: boolean
  compact?: boolean
  remove?: boolean
  isButton?: boolean
  handleRemove?: () => void
}

const TagCard = ({
  _id,
  name,
  questions,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDeviconClassName(name)
  const iconDescription = getTechDescription(name)
  const Content = (
    <>
      <Badge className="flex justify-between gap-2 subtle-medium background-light800_dark300 text-light400_light500 rounded-md p-4 border-none  uppercase">
        <div className="flex-center space-x-2 ">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>

        {remove && (
          <Image
            src={"/icons/close.svg"}
            width={12}
            height={12}
            alt="close icon"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>
      {showCount && (
        <p
          className="flex-center min-w-10! px-2 small-medium text-dark500_light700
 background-light800_dark300  rounded-full"
        >
          {questions}
        </p>
      )}
    </>
  )

  if (compact) {
    return isButton ? (
      <button
        onClick={(e) => e.preventDefault()} // to not let page reload on button click; which is submit by default so avoid it
        className="flex justify-between gap-2"
      >
        {Content}
      </button>
    ) : (
      <Link href={ROUTES.TAG(_id)} className="flex justify-between gap-2">
        {Content}
      </Link>
    )
  }
  return (
    <Link href={ROUTES.TAG(_id)} className="w-full shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10">
        <div className="flex items-center justify-between gap-3">
          <div className="background-light800_dark300  w-fit rounded-sm px-5 py-1.5">
            <p className="paragraph-semibold text-light400_light500">{name}</p>
          </div>
          <i className={cn(iconClass, "text-2xl")} aria-hidden="true" />
        </div>

        <p className="small-regular text-dark500_light700 mt-5 line-clamp-3 w-full">
          {iconDescription}
        </p>

        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">
            {questions}+
          </span>
          Questions
        </p>
      </article>
    </Link>
  )
}
export default TagCard
