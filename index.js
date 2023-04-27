import express from "express"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import cors from "cors";
import { connect } from "./db.js";
import { Question } from "./question.js";

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    search(query: String): [Question],
    userQuestions(query: String): [Question],
    addQuestion(user: String, question: String, subscribe: Boolean): Question,
    page(query: Int): Page
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

const sortByDate = (questions) => {
  return questions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// The root provides a resolver function for each API endpoint
const root = {
  userQuestions: async ({ query }) => {
    const questions = await Question.find({ user: query })
    return sortByDate(questions);
  },
  search: async ({ query }) => {
    const questions = await Question.find({ $or: [{ question: { "$regex": query, "$options": "i" } }, { anwwer: { "$regex": query, "$options": "i" } }] })
    return sortByDate(questions);
  },
  addQuestion: async ({ user, question, subscribe }) => {
    const newQuestion = await new Question({
      user,
      question,
      subscribe,
      date: new Date()
    })

    const savedQuestion = await newQuestion.save();
    return savedQuestion;
  },
  answerQuestion: async ({ id, answer }) => {
    const question = await Question.findByIdAndUpdate(id, { answer })
    return question
  },
  page: async ({ query }) => {
    const pageLength = 10;
    const questions = await Question.find();

    return {
      questions: questions.slice(query * pageLength, (query + 1) * pageLength),
      maxPage: Math.floor(questions.length / pageLength)
    }
  }
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