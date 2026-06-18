import Image from "next/image"
import Link from "next/link"
import { Theme } from "./theme"
import { MobileNavigation } from "./MobileNavigation"

const NavBar = () => {
  return (
    <div className="flex-between background-light900_dark200 sticky top-0 z-50 w-full  p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex-center gap-1 ">
        <Image
          src="/images/site-logo.svg"
          alt="Dev Overflow Logo"
          width={30}
          height={30}
        />
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Overflow</span>
        </p>
      </Link>

      <p>Global Search</p>

      <div className="flex-between gap-5">
        <Theme />
        <MobileNavigation />
      </div>
    </div>
  )
}

export default NavBar
