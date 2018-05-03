'use strict'

const LRU = require('lru-cache')
const Promise = require('bluebird')
const {
  axiosInit,
  warmCacheList,
  warmCacheRefreshTime,
} = require('../consts')

let lruCache = function () {
  this.cachedObj = LRU({
    max: 1000,
    maxAge: 1000 * 60 * warmCacheRefreshTime,
  })
}

lruCache.prototype.setItem = function (key, value) {
  return Promise.resolve(this.cachedObj.set(key, value))
}

lruCache.prototype.hasItem = function (key) {
  return Promise.resolve(this.cachedObj.has(key))
}

lruCache.prototype.getItem = function (key) {
  return Promise.resolve(this.cachedObj.get(key))
}

module.exports.serverApiController = function () {
  let api
  if (process.__API__) {
    api = process.__API__
  }
  else {
    api = process.__API__ = axiosInit({url: null})
    
    api.onServer = true
    
    // fetched item cache
    api.cachedItems = new lruCache()
    api.cachedIds = {}
    
    warmCacheList.forEach(type => {
      api.cachedIds[type] = {}
    })
  }
  return api
}
