/**
 * API entry point
 *
 *
 */
'use strict'

const Promise = require('bluebird')
const {
  warmCacheRefreshTime,
} = require('./consts')

const {endPoints} = require('./end-points')
const {apiRouter} = require('./services')

const LOG = process.env.NODE_ENV !== 'production',
  api = apiRouter

if (api.onServer) {
  warmCache()
}

function warmCache () {
  fetchItems({request: api.cachedIds, allowCache: true, rebuildCache: true})
  setTimeout(warmCache, 1000 * 60 * warmCacheRefreshTime)
}

function sanitizeRequestString (request, queryString, postData = null) {
  if (queryString) {
    request += '----' + queryString
  }
  try {
    if (postData && Object.keys(postData).length > 0) {
      request += '____' +
        JSON.stringify(postData).
        replace(/[^a-zA-Z0-9_\-]/gi, '__').
        replace(/__{2,}/gi, '__')
    }
  }
  catch (e) {
    LOG && console.error(e)
  }
  
  return request.replace(/[^a-zA-Z0-9_\-]/gi, '_---_')
}

function fetch ({request, queryString = null, data = {}, allowCache = false, rebuildCache = false, args}) {
  let cache = api.cachedItems
  if (typeof args === 'undefined' || !args) {
    args = {}
  }
  let {allowDataCache = false, customEndPoint = null} = args,
    requestMode, actionType, requestModeApiURL
  
  if (customEndPoint) {
    if (Object.keys(customEndPoint).length < 1 ||
      !customEndPoint.apiUrl ||
      !customEndPoint.method
    ) {
      LOG && console.warn(`Invalid custom end point request data`)
      return false
    }
    
    LOG && console.info(
      `Processing Custom end point request: ${customEndPoint.apiUrl}`)
    
    actionType = customEndPoint.method.toLowerCase().trim()
    requestModeApiURL = (typeof queryString !== 'undefined' && queryString !==
      null)
      ? customEndPoint.apiUrl.trim() + queryString.trim()
      : customEndPoint.apiUrl.trim()
  }
  else {
    LOG && console.info(`Processing request for: ${request}`)
    if (typeof request === 'undefined' || !request) {
      LOG && console.warn(`Quiting undefined request: ${request}`)
      return false
    }
    else if (typeof endPoints[request] === 'undefined' ||
      !endPoints[request]) {
      LOG && console.warn(`Quiting unknown request: ${request}`)
      return false
    }
    
    requestMode = endPoints[request]
    actionType = endPoints[request].method.toLowerCase().trim()
    requestModeApiURL = (typeof queryString !== 'undefined' && queryString !==
      null)
      ? requestMode.apiUrl.trim() + queryString.trim()
      : requestMode.apiUrl.trim()
  }
  
  //rebuild the cache
  if (rebuildCache) {
    LOG && console.info(`(Re)building cache for the request: ${request}.`)
    allowCache = false
    allowDataCache = false
  }
  
  return new Promise((resolve, reject) => {
    validateCache(
      {
        requestModeApiURL,
        allowDataCache,
        allowCache,
        cache,
        request,
        queryString,
        data,
      },
    ).
    then(response => {
      if (typeof response === 'undefined' || response === null) {
        return fetchNewItem({
          rebuildCache,
          allowCache,
          allowDataCache,
          actionType,
          requestModeApiURL,
          request,
          queryString,
          cache,
          api,
          data,
        })
      }
      resolve(response)
    }).
    then(response => {
      resolve(response)
    }).
    catch(error => {
      LOG &&
      console.error(
        `validate cache error for the request: ${requestModeApiURL} => `,
        error)
      resolve(null)
    })
  })
}

function validateCache ({
  requestModeApiURL, allowDataCache, allowCache, cache, request, queryString, data,
}) {
  if (allowDataCache && cache) {
    return new Promise((resolve, reject) => {
      cache.hasItem(sanitizeRequestString(request, queryString, data)).
      then(cacheResponse => {
        if (cacheResponse) {
          LOG && console.info(`Data cache hit for ${request}.`)
          
          return cache.getItem(
            sanitizeRequestString(request, queryString, data),
          )
        }
        resolve(null)
      }).
      then(cacheResponse => {
        resolve(cacheResponse)
      }).
      catch(cacheError => {
        LOG && console.error(
          `validateCache 'Data cache' error for the request: ${requestModeApiURL} => `,
          cacheError)
        resolve(null)
      })
    })
  }
  
  if (allowCache && cache) {
    return new Promise((resolve, reject) => {
      cache.hasItem(sanitizeRequestString(request, queryString)).
      then(cacheResponse => {
        if (cacheResponse) {
          LOG && console.info(`Cache hit for ${request}.`)
          return cache.getItem(
            sanitizeRequestString(request, queryString),
          )
        }
        resolve(null)
      }).
      then(cacheResponse => {
        resolve(cacheResponse)
      }).
      catch(cacheError => {
        LOG && console.error(
          `validateCache 'Cache' error for the request: ${requestModeApiURL} => `,
          cacheError)
        resolve(null)
      })
    })
  }
  
  return Promise.resolve(null)
}

function fetchNewItem ({rebuildCache, allowCache, allowDataCache, actionType, requestModeApiURL, request, queryString, cache, api, data}) {
  return new Promise((resolve, reject) => {
    if (rebuildCache) {
      allowCache = true
      allowDataCache = true
    }
    
    switch (actionType) {
      case 'get':
      default:
        LOG && console.info(`GET request recieved: ${requestModeApiURL}`)
        api.get(requestModeApiURL).then(response => {
          if (allowCache && cache) {
            
            response.data.__cacheLastUpdated = Date.now()
            cache.setItem(
              sanitizeRequestString(request, queryString),
              response.data,
            ).
            catch(cacheError => {
              LOG && console.error(
                `Cache setItem error for GET request: ${requestModeApiURL} => `,
                cacheError)
            })
          }
          
          resolve(response.data)
        }, error => {
          LOG &&
          console.error(`Error fetching ${requestModeApiURL} => ${error}`)
          resolve(null)
        })
        break
      case 'post':
        LOG && console.info(`POST request recieved: ${requestModeApiURL}`)
        api.post(requestModeApiURL, data, {}).
        then(response => {
          if (allowDataCache && cache) {
            
            response.data.__cacheLastUpdated = Date.now()
            cache.setItem(
              sanitizeRequestString(request, queryString, data),
              response.data,
            ).
            catch(cacheError => {
              LOG && console.error(
                `Data Cache setItem error for POST request: ${requestModeApiURL} => `,
                cacheError)
            })
          }
          else if (allowCache && cache) {
            response.data.__cacheLastUpdated = Date.now()
            cache.setItem(
              sanitizeRequestString(request, queryString),
              response.data,
            ).
            catch(cacheError => {
              LOG && console.error(
                `Cache setItem error for POST request: ${requestModeApiURL} => `,
                cacheError)
            })
          }
          resolve(response.data)
        }, error => {
          LOG &&
          console.error(`Error fetching ${requestModeApiURL} => ${error}`)
          resolve(null)
        })
        break
      case 'put':
        LOG && console.info(`PUT request recieved: ${requestModeApiURL}`)
        api.put(requestModeApiURL, data, {}).
        then(response => {
          if (allowCache && cache) {
            response.data.__cacheLastUpdated = Date.now()
            cache.setItem(sanitizeRequestString(request, queryString),
              response.data).
            catch(cacheError => {
              LOG && console.error(
                `Cache setItem error for PUT request: ${requestModeApiURL} => `,
                cacheError)
            })
          }
          resolve(response.data)
        }, error => {
          LOG &&
          console.error(`Error fetching ${requestModeApiURL} => ${error}`)
          resolve(null)
        })
        break
      case 'delete':
        LOG && console.info(`DELETE request recieved: ${requestModeApiURL}`)
        api.delete(requestModeApiURL).then(response => {
          if (allowCache && cache) {
            response.data.__cacheLastUpdated = Date.now()
            cache.setItem(sanitizeRequestString(request, queryString),
              response.data).
            catch(cacheError => {
              LOG && console.error(
                `Cache setItem error for DELETE request: ${requestModeApiURL} => `,
                cacheError)
            })
          }
          resolve(response.data)
        }, error => {
          LOG &&
          console.error(`Error fetching ${requestModeApiURL} => ${error}`)
          resolve(null)
        })
        break
    }
  })
}

function fetchItem ({request, queryString = null, data = {}, allowCache = false, rebuildCache = false, args}) {
  return Promise.resolve(fetch({
    request: request,
    queryString: queryString,
    data: data,
    allowCache: allowCache,
    rebuildCache: rebuildCache,
    args,
  }))
}

function fetchItems ({request, allowCache = false, rebuildCache = false, args}) {
  return Promise.all(Object.keys(request).map(a =>
    fetchItem({
      request: a,
      queryString: typeof request[a].queryString === 'undefined'
        ? null
        : request[a].queryString,
      data: typeof request[a].data === 'undefined' ? {} : request[a].data,
      allowCache: allowCache,
      rebuildCache: rebuildCache,
      args,
    }),
  ))
}

/**
 * @param request: End point to hit; Find the endpoint reference from 'end-points.js'
 * @param queryString: Query string or parameters to hit the API,
 * @param data: Body data for POST and PUT action types; No data is accepted by GET or DELETE
 * @param allowCache: Allow the caching of output data; It will be different for different query string parameters. Or read from an already cached record.
 * @param rebuildCache: Purge the old cache and fetch the new data
 * @param allowDataCache: Allow the caching of the POST body data.
 *  Eg: Various combinations of post parameters along with the respective output can be cached for an ecommerce/classified website options filter. This saves a massive amount of API calls by caching previous records of the filter combinations.
 * @param ...args: {customEndPoint}
 * customEndPoint => Dynamically generated end points along with url and method
 * @returns Promise
 */

module.exports.make = function ({request, queryString = null, data = {}, allowCache = false, rebuildCache = false, allowDataCache = false, ...args}) {
  return fetchItem({
    request: request,
    queryString: queryString,
    data: data,
    allowCache: allowCache,
    rebuildCache: rebuildCache,
    args,
  }).then(response => {
    if (typeof response !== 'undefined' && response !== null) {
      return response
    }
    else {
      LOG && console.error(`Invalid response | Make => ${request}`)
      return null
    }
  })
}
