import { model, models, Schema, Types } from "mongoose"

// export interface IInteraction {
//   user: Types.ObjectId
//   action: string
//   actionId: Types.ObjectId
//   actionType: "question" | "answer"
// }

const ModelSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    actionId: { type: Schema.Types.ObjectId, required: true },
    actionType: { type: String, enum: ["question", "answer"] },
  },
  { timestamps: true },
)

const Model = models?.Model || model("Model", ModelSchema)

export default Model
