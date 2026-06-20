interface Tag {
  _id: string
  name: string
}

interface Author {
  _id: string
  name: string
  image: string
}

interface Question {
  _id: string
  title: string
  content: string
  tags: Tag[]
  author: Author
  upvotes: number
  answers: number
  views: number
  createdAt: Date
}

type ActionResponse<T = null> = {
  success: boolean
  data?: T // if success true, T = whatever coming in from db
  error?: {
    // if no data or sucess is false then its error
    message: string
    details?: Record<string, string[]>
  }
  status?: number
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true }
type ErrorResponse = ActionResponse<undefined> & { success: false }

interface RouteParams {
  params: Promise<Record<string, string>>
  searchParams: Promise<Record<string, string>>
}
