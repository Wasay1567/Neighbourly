import fs from 'fs'
import path from 'path'
import { db } from '../config/db.js'

const migrationsPath = path.join(process.cwd(), 'src/database/migrations')

export async function runMigrations() {
  const files = fs.readdirSync(migrationsPath)

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8')
    await db.exec(sql)
  }
}
