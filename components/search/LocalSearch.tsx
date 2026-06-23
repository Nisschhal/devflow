"use client"
import Image from "next/image"
import { Input } from "../ui/input"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url"

interface Props {
  route: string
  imgSrc: string
  placeholder: string
  iconPosition?: "left" | "right"
  otherClasses?: string
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  iconPosition = "left",
  otherClasses,
}: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get("query")

  const [search, setSearch] = useState<string>(query || "")

  // Debounce: wait for user to stop typing before updating the URL
  // Every keystroke changes `search`, which re-runs this effect.
  // But before re-running, React calls the cleanup (clearTimeout) first,
  // which kills the previous timer. So only the LAST timer survives.
  // That's debouncing — cancel old, start new, only the final one fires.
  useEffect(() => {
    // Start a 300ms timer. If the user types again within 300ms,
    // this timer gets cancelled by the cleanup below.
    const delayDebounceFn = setTimeout(() => {
      // If we reach here, 300ms passed with no new keystroke.
      if (search) {
        // User typed something — add "query" param to URL
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: search,
        })

        router.push(newUrl, { scroll: false })
      } else {
        // User cleared the input — remove "query" param from URL
        // Only do this if we're on the correct page
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          })

          router.push(newUrl, { scroll: false })
        }
      }
    }, 300)

    // Cleanup: runs BEFORE the next re-run, cancelling the old timer.
    // This is what makes debouncing work — old timers never fire.
    return () => clearTimeout(delayDebounceFn)
  }, [search, route, pathname, router])

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-hidden"
      />

      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          alt="search"
          width={15}
          height={15}
          className="cursor-pointer"
        />
      )}
    </div>
  )
}

export default LocalSearch
