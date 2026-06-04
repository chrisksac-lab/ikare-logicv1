import dotenv from 'dotenv-flow'
dotenv.config()

export const config={
    ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
    TRANSACTION_EQUIV: process.env.TRANSACTION_EQUIV,
    JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME
}
