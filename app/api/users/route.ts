import User from "@/database/user.model"
import handleError from "@/lib/handlers/error"
import { ValidationError } from "@/lib/http-error"
import dbConnect from "@/lib/mongoose"
import { UserSchema } from "@/lib/validation"
import { APIErrorResponse } from "@/types/api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await dbConnect() // if not connected connect
    const users = await User.find()
    return NextResponse.json({ success: true, data: users }, { status: 200 })
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect() // if not connected connect
    const body = await request.json()

    const validatedData = UserSchema.safeParse(body)

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors)
    }

    const { email, username } = validatedData.data
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error("User with email already exist!")
    }
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      throw new Error("User with username already exist!")
    }

    const newUser = await User.create(validatedData.data)

    return NextResponse.json({ success: true, data: newUser }, { status: 201 })
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse
  }
}
