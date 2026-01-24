import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { env } from './env.js'

export const db = await open({
  filename: env.DB_PATH,
  driver: sqlite3.Database
})
