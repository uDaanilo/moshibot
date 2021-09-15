import mongoose from 'mongoose'

console.log('[DB] Connecting...')

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => console.log('[DB] Connected!'))
  .catch(err => {
    console.error(new Error(`[DB] An error ocurred: ${err.message}`))

    process.exit(1)
  })