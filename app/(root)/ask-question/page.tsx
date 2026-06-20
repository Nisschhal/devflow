import { auth } from "@/auth"
import QuestionForm from "@/components/cards/QuestionForm"
import ROUTES from "@/constants/route"
import { redirect } from "next/navigation"

const AskAQuestion = async () => {
  const session = await auth()

  if (!session) return redirect(ROUTES.SIGN_IN)

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>

      <div className="mt-9">
        <QuestionForm />
      </div>
    </>
  )
}

export default AskAQuestion
