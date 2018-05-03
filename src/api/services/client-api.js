'use strict'

const localforage = require('localforage')
const Promise = require('bluebird')
const {
  axiosInit,
  warmCacheRefreshTime,
} = require('../consts')

let localForageCache = function () {
  localforage.config({
    driver:
      [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE,
      ],
    name: '__AXIOS__ISOMORPHIC__',
    version: 1.0,
    size: 4980736,
    storeName: '__axios__isomorphic__store__',
    description: 'Axios Isomorphic Routing Controller',
  })
  
  localforage.setDriver([
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE,
  ])
  
  this.cachedObj = localforage.createInstance({
    name: '__axios__isomorphic__store__',
  })
}

localForageCache.prototype.setItem = function (key, value) {
  return Promise.resolve(this.cachedObj.setItem(key, value))
}

localForageCache.prototype.hasItem = function (key) {
  return new Promise((resolve, reject) => {
    this.cachedObj.getItem(key).then(response => {
      if (response && response !== null) {
        let value = response,
          timeNow = Date.now(),
          lastCachedTime = value.__cacheLastUpdated
        
        if (typeof value.__cacheLastUpdated !== 'undefined' &&
          value.__cacheLastUpdated &&
          ((timeNow - lastCachedTime) / (1000 * 60) < warmCacheRefreshTime)) {
          resolve(true)
        }
      }
      
      resolve(false)
    })
  })
  
}

localForageCache.prototype.getItem = function (key) {
  return Promise.resolve(this.cachedObj.getItem(key))
}

localForageCache.prototype.removeItem = function (key) {
  return Promise.resolve(this.cachedObj.removeItem(key))
}

localForageCache.prototype.clear = function () {
  return Promise.resolve(this.cachedObj.clear())
}

module.exports.clientApiController = function () {
  let api
  
  if (process.__API__) {
    api = process.__API__
  }
  else {
    api = process.__API__ = axiosInit({url: null})
    
    api.onServer = false
    
    // fetched item cache
    api.cachedItems = new localForageCache()
    
    api.cachedIds = {}
  }
  return api
}
