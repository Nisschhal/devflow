"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import ROUTES from "@/constants/route"
import { globalSearch } from "@/lib/actions/general.action"
import { cn } from "@/lib/utils"

// One place describing each entity type: its label, icon, and destination.
const SEARCH_TYPES: {
  value: GlobalSearchType
  label: string
  icon: string
  href: (id: string) => string
}[] = [
  {
    value: "question",
    label: "Questions",
    icon: "/icons/question.svg",
    href: ROUTES.QUESTION,
  },
  {
    value: "answer",
    label: "Answers",
    icon: "/icons/message.svg",
    href: ROUTES.QUESTION,
  },
  {
    value: "user",
    label: "Users",
    icon: "/icons/account.svg",
    href: ROUTES.PROFILE,
  },
  {
    value: "tag",
    label: "Tags",
    icon: "/icons/tag.svg",
    href: ROUTES.TAG,
  },
]

const GlobalSearch = () => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [type, setType] = useState<GlobalSearchType | null>(null)
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ⌘K (or Ctrl+K) toggles the palette from anywhere in the app.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Debounce the query so we hit the server once the user pauses, not on every
  // keystroke. Re-runs when the type filter changes too, so switching filters
  // refetches against the same query.
  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Guards against an older, slower request overwriting a newer result.
    let cancelled = false

    const timeout = setTimeout(async () => {
      const result = await globalSearch({ query: search.trim(), type })

      if (cancelled) return

      setResults(result.success && result.data ? result.data : [])
      setIsLoading(false)
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [search, type])

  // Reset back to a clean palette each time it closes.
  useEffect(() => {
    if (!open) {
      setSearch("")
      setType(null)
      setResults([])
    }
  }, [open])

  const handleSelect = useCallback(
    (item: GlobalSearchResult) => {
      const config = SEARCH_TYPES.find((t) => t.value === item.type)
      if (!config) return

      setOpen(false)
      router.push(config.href(item.id))
    },
    [router],
  )

  return (
    <>
      {/* Desktop: a search bar matching LocalSearch's shape */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="background-light800_darkgradient relative hidden min-h-[56px] grow items-center gap-4 rounded-xl px-4 sm:mx-8 sm:flex sm:max-w-[600px]"
      >
        <Image
          src="/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <span className="paragraph-regular text-dark400_light700 grow text-left">
          Search anything globally...
        </span>
        <kbd className="small-medium text-light-500 background-light800_dark300 light-border rounded-md border px-2 py-1">
          ⌘K
        </kbd>
      </button>

      {/* Mobile: icon only — the full-width bar doesn't fit next to the logo */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        className="background-light800_darkgradient flex-center size-11 rounded-xl sm:hidden"
      >
        <Image src="/icons/search.svg" alt="search" width={20} height={20} />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Global search"
        description="Search across questions, answers, users and tags."
        // Centred vertically and capped to the viewport, so a long result list
        // scrolls inside the dialog instead of running off the bottom of the
        // screen. flex + min-h-0 below is what makes the inner list scrollable.
        className="background-light800_darkgradient light-border top-1/2 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl -translate-y-1/2 flex-col gap-0 overflow-hidden border p-0"
      >
        {/* shouldFilter=false: the server already decided what matches, so cmdk
            must not re-filter the list against the raw input. */}
        <Command
          shouldFilter={false}
          className="background-light800_darkgradient flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl! p-0"
        >
          <div className="flex shrink-0 items-center gap-4 px-5 py-4">
            <Image
              src="/icons/search.svg"
              alt="search"
              width={24}
              height={24}
            />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, answers, users, tags..."
              className="paragraph-regular text-dark400_light700 placeholder no-focus grow border-none bg-transparent outline-hidden"
            />
          </div>

          <CommandSeparator className="light-border-2" />

          <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 py-3">
            <p className="body-medium text-dark400_light900 mr-1">Filter:</p>
            <FilterChip
              label="All"
              active={type === null}
              onClick={() => setType(null)}
            />
            {SEARCH_TYPES.map((t) => (
              <FilterChip
                key={t.value}
                label={t.label}
                active={type === t.value}
                onClick={() => setType(type === t.value ? null : t.value)}
              />
            ))}
          </div>

          <CommandSeparator className="light-border-2" />

          {/* min-h-0 lets this shrink below its content height so it — rather
              than the dialog — is what scrolls. */}
          <CommandList className="max-h-none min-h-0 flex-1 px-2 py-2">
            {!search.trim() ? (
              <p className="body-regular text-dark500_light700 py-8 text-center">
                Start typing to search across the whole site.
              </p>
            ) : isLoading ? (
              <div className="flex-center flex-col gap-3 py-8">
                <Image
                  src="/icons/stars.svg"
                  alt="loading"
                  width={24}
                  height={24}
                  className="animate-pulse"
                />
                <p className="body-regular text-dark200_light800">
                  Browsing the entire database...
                </p>
              </div>
            ) : (
              <>
                <CommandEmpty className="body-regular text-dark500_light700 py-8 text-center">
                  Oops, no results found for &quot;{search}&quot;.
                </CommandEmpty>

                {SEARCH_TYPES.map((config) => {
                  const items = results.filter((r) => r.type === config.value)
                  if (items.length === 0) return null

                  return (
                    <CommandGroup
                      key={config.value}
                      heading={config.label}
                      className="[&_[cmdk-group-heading]]:small-semibold [&_[cmdk-group-heading]]:text-light400_light500 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:uppercase"
                    >
                      {items.map((item) => (
                        <CommandItem
                          key={`${item.type}-${item.id}`}
                          // cmdk matches on value; keep it unique per row so
                          // duplicate titles don't collapse into one entry.
                          value={`${item.type}-${item.id}`}
                          onSelect={() => handleSelect(item)}
                          className="text-dark200_light800 hover:background-light700_dark400 data-[selected=true]:background-light700_dark400 flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5"
                        >
                          <Image
                            src={config.icon}
                            alt={config.label}
                            width={18}
                            height={18}
                            className="invert-colors mt-0.5 shrink-0 object-contain"
                          />
                          <span className="body-medium line-clamp-1">
                            {item.title}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "small-medium shrink-0 rounded-2xl px-3.5 py-1.5 capitalize transition-colors",
      active
        ? "primary-gradient text-light-900"
        : "background-light800_dark300 text-light400_light500 hover:opacity-80",
    )}
  >
    {label}
  </button>
)

export default GlobalSearch
