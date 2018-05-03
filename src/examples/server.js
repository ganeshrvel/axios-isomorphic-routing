'use strict'

const {make} = require('../api/index')

module.exports = function () {
  /**
   * Server side API call.
   * These calls are isolated from the client side API calls
   */
  make({
    request: 'POST_CITIES',
    queryString: null,
    data: {'countries': 'China', 'limit': 2},
    allowCache: true,
    rebuildCache: false,
    append: false,
    allowDataCache: true,
    customEndPoint: null,
  }).then(response => {
    console.log('############ Server side API fetch ##########################')
    console.log(`
        request: 'POST_CITIES',
      queryString: null,
      data: {'countries': 'China', 'limit': 2},
      allowCache: true,
      rebuildCache: false,
      append: false,
      allowDataCache: true,
      customEndPoint: null`)
    console.log(JSON.stringify(response))
    console.log('######################################')
  })
  
  /**
   * warmCacheList as defined in: 'src/api/consts.js'
   *
   * 'GET_TEST1' is defined in the Warm cache refresh list;
   * The list will keep getting updated at a regular interval.
   * Hitting the same end point will fetch value the already existing warm cache.
   * To over ride the Warm cache allowCache can be set false.
   */
  make({
    request: 'GET_TEST1',
    queryString: null,
    data: {},
    allowCache: true,
    rebuildCache: false,
    append: false,
    allowDataCache: false,
    customEndPoint: null,
  }).then(response => {
    console.log('############ warmCacheList demo ##########################')
    console.log(`
    request: 'GET_TEST1',
    queryString: null,
    data: {},
    allowCache: true,
    rebuildCache: false,
    append: false,
    allowDataCache: false,
    customEndPoint: null,`)
    console.log(response)
    console.log('######################################')
  })
  
  /**
   * Go through 'src/examples/client.js' for detailed explanation on the methods and parameters used here
   */
}
