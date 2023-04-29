import express from "express"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import cors from "cors";
import { userQuestions, search, addQuestion, answerQuestion, page, faq, deleteQuestion, updateFaq } from "./dataFunctions.js";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    search(query: String): [Question],
    userQuestions(query: String): [Question],
    addQuestion(user: String, question: String, subscribe: Boolean): Question,
    page(query: Int, onlyUnanswered: Boolean, showFaq: Boolean): Page,
    faq(nothing: String): [Question],
    answerQuestion(id: String, answer: String): [Question],
    deleteQuestion(id: String): [Question],
    updateFaq(id: String, isFaq: Boolean): Question,
  }

  type Question {
    _id: String,
    user: String,
    question: String,
    answer: String,
    date: String,
    subscribe: Boolean,
    isFaq: Boolean
  }

  type Page {
    questions: [Question],
    maxPage: Int
  }
`)


// The root provides a resolver function for each API endpoint
const root = {
  userQuestions, search, addQuestion, answerQuestion, page, faq, deleteQuestion, updateFaq
}

const app = express()
app.use(cors({
  origin: ["http://localhost:3000", "https://next-mainliber.vercel.app"]
}));
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)

app.listen(4000)
console.log("server up")