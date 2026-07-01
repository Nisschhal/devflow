interface Tag {
  _id: string
  name: string
  questions?: number
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
  downvotes: number
  answers: number
  views: number
  createdAt: Date
}

interface Answer {
  _id: string
  author: Author
  content: string
  upvotes: number
  question: string
  downvotes: number
  createdAt: Date
}
interface CreateVoteParams {
  targetId: string
  targetType: "question" | "answer"
  voteType: "upvote" | "downvote"
}

interface HasVotedResponse {
  hasUpvoted: boolean
  hasDownvoted: boolean
}

interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1
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

interface User {
  _id: string
  name: string
  username: string
  email: string
  bio?: string
  image?: string
  location?: string
  portfolio?: string
  reputation?: number
}

interface CollectionBaseParams {
  questionId: string
}

interface Collection {
  _id: string
  author: string | Author
  question: Question
}

interface User {
  _id: string
  name: string
  username: string
  email: string
  bio?: string
  image?: string
  location?: string
  portfolio?: string
  reputation?: number
  createdAt: Date
}

interface Badges {
  GOLD: number
  SILVER: number
  BRONZE: number
}
