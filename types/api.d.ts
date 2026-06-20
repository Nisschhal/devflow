import { NextResponse } from "next/server"
// these response type is not gloablly avaiable because it required NextResponse so

type APIErrorResponse = NextResponse<ErrorResponse>
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>
