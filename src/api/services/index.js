/**
 * Service Routing
 */
'use strict'

const IS_CLIENT = (typeof window !== 'undefined' && window)

function __routing () {
  if (IS_CLIENT) {
    const {clientApiController} = require('./client-api')
    return clientApiController()
  }
  const {serverApiController} = require('./server-api')
  return serverApiController()
}

module.exports.apiRouter = __routing()
