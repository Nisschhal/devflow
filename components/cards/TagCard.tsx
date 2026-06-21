import ROUTES from "@/constants/route"
import Link from "next/link"
import React from "react"
import { Badge } from "../ui/badge"
import { getDeviconClassName } from "@/lib/utils"
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
  const Content = (
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
  )

  {
    showCount && (
      <p className="small-medium text-dark500_light700">{questions}</p>
    )
  }

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
}
export default TagCard
