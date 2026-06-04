import dotenv from 'dotenv-flow'
dotenv.config({path: 'local.env'})
dotenv.config()

export const config={
    dbname: process.env.DB_NAME,
    dbport: process.env.DB_PORT,
    dbhost: process.env.DB_HOST,
    dbuser: process.env.DB_USER,
    dbpassword: process.env.DB_PASSWORD
}

