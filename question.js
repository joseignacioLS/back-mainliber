import mongoose from "mongoose";

const Schema = mongoose.Schema
const questionSchema = new Schema(
  {
    user: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: false },
    date: { type: String, required: true },
    subscribe: { type: Boolean, required: false },
    isFaq: { type: Boolean, required: false },
  },
  {
    collection: "questions"
  }
)

const Question = mongoose.model("Question", questionSchema)

export { Question }