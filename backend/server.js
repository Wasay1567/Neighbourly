import app from './app.js'
import { env } from './config/env.js'
import { runMigrations } from './database/runMigrations.js'

await runMigrations()

app.listen(env.PORT, () =>
  console.log(`Server running on port ${env.PORT}`)
)
