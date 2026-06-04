import dotenv from 'dotenv-flow'
dotenv.config({path: 'local.env'})

export const config={
    senderEmail: process.env.SENDER_EMAIL,
    emailPassword: process.env.EMAIL_PASSWORD
}