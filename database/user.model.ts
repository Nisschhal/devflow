import { InferSchemaType, model, models, Schema } from "mongoose"

// export interface IUser {
//   name: string
//   username: string
//   email: string
//   bio?: string
//   image: string
//   location?: string
//   portfolio?: string
//   reputation?: string
// }

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    image: { type: String, required: true },
    location: { type: String },
    portfolio: { type: String },
    reputation: { type: String },
  },
  { timestamps: true },
)

/**
 * Auto adds the TS in model upon seeing this during dev prod. as Mongoose is smart.
 * If you use model<IUser>("User", UserSchema) you would have to write twice, which was the old way.
 * But with InferSchemaType it happens automatically for dev workflow.
 */
// export type UserType = InferSchemaType<typeof UserSchema>

/**
 * requires check of modal to avoide multiple model creation of same schema
 * NextJS doesn't kill process but only change the specific changed files due to which model might already existed.
 * Express is different case, when a file is changed it kills the entire process and recreate it like reset but not in Next.js.
 * So not checking model if already existed will cause error as trying to create same model again.
 */

const User = models?.User || model("User", UserSchema)
export default User
