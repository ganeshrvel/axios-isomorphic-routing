/**
 * Constants and predefines values
 */
'use strict'

const axios = require('axios')
const IS_DEV = process.env.NODE_ENV !== 'production',
  DEV_API_URL = 'http://localhost:3001/',
  PRODUCTION_API_URL = 'https://api.your-website.com/api/',
  
  WARM_CACHE_REFRESH_TIME = 30, //in seconds
  AXIOS_TIME_OUT = 25000,//in milliseconds
  LOG = IS_DEV

let BASE_URL = IS_DEV ? DEV_API_URL : PRODUCTION_API_URL

/**
 * Warm cache refresh list;
 * Allowed Methods: GET
 *
 * These are loaded when the server fires up and keeps refreshing every 'WARM_CACHE_REFRESH_TIME' seconds.
 * The list will keep getting updated at a regular interval.
 * Usage: Website wide data caching.
 * Scope: Server only. Client can't access this data.
 *
 *
 * Important: DO NOT add the APIs used for fetching personal user data.
 */
module.exports.warmCacheList = [
  'GET_TEST1',
]

//Warm cache refresh delay value;
module.exports.warmCacheRefreshTime = WARM_CACHE_REFRESH_TIME

module.exports.axiosInit = function ({url = ''}) {
  LOG && console.info(`Initializing Axios...`)
  if (url && url.trim() !== '') {
    BASE_URL = url
    LOG && console.info(`fetching: ${BASE_URL}`)
  }
  return axios.create({
    baseURL: BASE_URL,
    timeout: AXIOS_TIME_OUT,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    crossdomain: true,
    withCredentials: true,
  })
}
