import mongoose from "mongoose";
const Schema = mongoose.Schema

const questionAnswer = new Schema({
    question: String,
    answer: String
})

const followupSchema = new Schema({
    source: String,
    communication: [questionAnswer]
})