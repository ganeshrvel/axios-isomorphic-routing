/**
 * This is the server side entry point.
 *
 */
'use strict'

import express from 'express'
import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackConfig from './webpack.config.js'

const PORT = process.env.PORT || 3001
const app = express()
const router = express.Router()
const expressRouter = require('./express/routes')(
  {router: router, app: app})
app.use(expressRouter)

router.get('/demo/server', (req, res) => {
  //execute the APIs example for server
  const serverExample = require('./src/examples/server')
  serverExample()
  
  res.end(`Check server console for the output..`)
})

app.use(
  webpackMiddleware(
    webpack(webpackConfig),
    {
      logLevel: 'error',
    },
  ),
)

app.listen(PORT, () => {
  console.info(`App fired at http://localhost:${PORT}`)
})
