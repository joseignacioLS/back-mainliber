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
    const questions = await Question.find({ $or: [{ question: { "$regex": query, "$options": "i" } }, { answer: { "$regex": query, "$options": "i" } }] })
    return sortByDate(questions);
  },
  addQuestion: async ({ user, question, subscribe }) => {
    const newQuestion = await new Question({
      user,
      question,
      subscribe,
      answer: "",
      isFaq: false,
      date: new Date()
    })

    const savedQuestion = await newQuestion.save();
    //enviar email al usuario confirmando
    return savedQuestion;
  },
  answerQuestion: async ({ id, answer }) => {
    const question = await Question.findByIdAndUpdate(id, { answer })
    // enviar email al usuario confirmando
    return question
  },
  page: async ({ query, onlyUnanswered, showFaq }) => {
    const pageLength = 10;
    let searchQuery = {}
    if (onlyUnanswered) {
      searchQuery = { ...searchQuery, answer: "" }
    }
    if (!showFaq) {
      searchQuery = { ...searchQuery, isFaq: false }
    }
    const questions = await Question.find(searchQuery);

    return {
      questions: questions.slice(query * pageLength, (query + 1) * pageLength),
      maxPage: Math.floor(questions.length / pageLength)
    }
  },
  faq: async () => {
    const questions = await Question.find({ isFaq: true })
    return questions
  },
  deleteQuestion: async ({ id }) => {
    const question = await Question.findByIdAndDelete(id);
    return question;
  },
  updateFaq: async ({ id, isFaq }) => {
    const extra = isFaq ? {
      date: new Date("2000/01/01"),
      user: "admin",
      subscribe: false
    } : {}
    const question = await Question.findByIdAndUpdate(id, {
      isFaq, ...extra
    })
    return question
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