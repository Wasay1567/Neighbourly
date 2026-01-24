import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: process.env.PORT,
  DB_PATH: process.env.DATABASE_PATH,
  JWT_SECRET: process.env.JWT_SECRET,
}
