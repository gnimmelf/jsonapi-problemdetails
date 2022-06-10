import { join } from 'path'
import express from 'express'

import { api } from './api-routes.mjs'

const app = express()
const port = process.env.PORT || 3000

// Routes

app.use(express.static('build'))

app.use('/api', api)

app.get('/', (req, res) => {
    res.sendFile(join(process.cwd(), 'build/index.html'))
})

// Kickoff

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})