import express from "express"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import cors from "cors";

const faq = [{
  user: "admin",
  question: "¿Cómo puedo hacerme socio de MainLiber?",
  date: new Date("2000/1/1"),
  answer:
    "Contacta con nosotros en fake@email.fk y conoce más sobre nuestro servicio personalizado.",
  isFaq: true
},
{
  user: "admin",
  question: "¿Cómo puedo hacerme socio de MainLiber?",
  date: new Date("2000/1/1"),
  answer:
    "Contacta con nosotros en fake@email.fk y conoce más sobre nuestro servicio personalizado.",
  isFaq: true
},
{
  user: "admin",
  question: "¿Cómo puedo hacerme socio de MainLiber?",
  date: new Date("2000/1/1"),
  answer:
    "Contacta con nosotros en fake@email.fk y conoce más sobre nuestro servicio personalizado.",
  isFaq: true
},
{
  user: "admin",
  question: "¿Cómo puedo hacerme socio de MainLiber?",
  date: new Date("2000/1/1"),
  answer:
    "Contacta con nosotros en fake@email.fk y conoce más sobre nuestro servicio personalizado.",
  isFaq: true
},
{
  user: "admin",
  question: "¿Cómo puedo hacerme socio de MainLiber?",
  date: new Date("2000/1/1"),
  answer:
    "Contacta con nosotros en fake@email.fk y conoce más sobre nuestro servicio personalizado.",
  isFaq: true
},]

const db = [
  {
    user: "carmenbonita.hola@gmail.com",
    question: "Lorem ipsum",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    date: new Date("2023/03/01")
  },
  {
    user: "ls.joseignacio@gmail.com",
    question: "¿Cómo es la intro del señor de los anillos?",
    answer: `Tres Anillos para los Reyes Elfos bajo el cielo.
    Siete para los Señores Enanos en casas de piedra.
    Nueve para los Hombres Mortales condenados a morir.
    Uno para el Señor Oscuro, sobre el trono oscuro
    en la Tierra de Mordor donde se extienden las Sombras.
    Un Anillo para gobernarlos a todos. Un Anillo para encontrarlos,
    un Anillo para atraerlos a todos y atarlos en las tinieblas
    en la Tierra de Mordor donde se extienden las Sombras`,
    date: new Date("2023/02/01")
  }
]


// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    search(query: String): [Question],
    userQuestions(query: String): [Question],
    addQuestion(user: String, question: String, subscribe: Boolean): Question,
  }

  type Question {
    user: String,
    question: String,
    answer: String,
    date: String,
    subscribe: Boolean,
    isFaq: Boolean
  }
`)

const sortByDate = (questions) => {
  return questions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// The root provides a resolver function for each API endpoint
const root = {
  userQuestions: ({ query }) => {
    return sortByDate(db.filter(value => value.user === query));
  },
  search: ({ query }) => {
    const pool = [...faq, ...db];
    return sortByDate(pool.
      filter(value => value.question.toLowerCase().includes(query.toLowerCase())
        || value.answer?.toLowerCase().includes(query.toLowerCase())))
  },
  addQuestion: ({ user, question, subscribe }) => {
    const newQuestion = {
      user,
      question,
      date: new Date(),
      subscribe
    }
    db.push(newQuestion)
    return newQuestion;
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