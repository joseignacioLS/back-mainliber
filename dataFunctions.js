
import { connect } from "./db.js";
import { Question } from "./question.js";


const sortByDate = (questions) => {
  return questions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const userQuestions = async ({ query }) => {
  const questions = await Question.find({ user: query })
  return sortByDate(questions);
}
export const search = async ({ query }) => {
  const questions = await Question.find({ $or: [{ question: { "$regex": query, "$options": "i" } }, { answer: { "$regex": query, "$options": "i" } }] })
  return sortByDate(questions);
}
export const addQuestion = async ({ user, question, subscribe }) => {
  console.log(question)
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
}
export const answerQuestion = async ({ id, answer }) => {
  const question = await Question.findByIdAndUpdate(id, { answer })
  // enviar email al usuario confirmando
  return question
}
export const page = async ({ query, onlyUnanswered, showFaq }) => {
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
}
export const faq = async () => {
  const questions = await Question.find({ isFaq: true })
  return questions
}
export const deleteQuestion = async ({ id }) => {
  const question = await Question.findByIdAndDelete(id);
  return question;
}
export const updateFaq = async ({ id, isFaq }) => {
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