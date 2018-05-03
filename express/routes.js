'use strict'
const Promise = require('bluebird')
const path = require('path')
const readFile = Promise.promisify(require('fs').readFile)
const filter = require('lodash/filter')
const bodyParser = require('body-parser')

const LOG = process.env.NODE_ENV !== 'production'

module.exports = function ({router, app}) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  
  //Get
  router.get('/cars', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    
    let {start, end} = req.query
    start = start || 1950
    end = end || 2018
    
    readFile(path.join(__dirname, 'mock-data/cars.json'), 'utf-8').
    then(response => {
      __return['data'] = [
        {
          result: filter(
            JSON.parse(response),
            (o) => { return o.cyear > start && o.cyear < end },
          ),
        },
        {
          randomValue: Math.random(),
        },
      ]
      res.end(JSON.stringify(__return))
    }).
    catch(e => {
      LOG && console.error(e)
      __return['is_success'] = false
      res.end(JSON.stringify(__return))
    })
  })
  
  //Post
  router.post('/cities', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    let {country, limit} = req.body
    country = country || 'China'
    limit = limit > 0 && limit <= 50 ? limit : 10
    
    readFile(path.join(__dirname, 'mock-data/cities.json'), 'utf-8').
    then(response => {
      __return['data'] = [
        {
          result: filter(
            JSON.parse(response),
            {country: country},
          ).slice(0, limit),
        },
        {
          randomValue: Math.random(),
        },
      ]
      
      res.end(JSON.stringify(__return))
    }).
    catch(e => {
      LOG && console.error(e)
      __return['is_success'] = false
      res.end(JSON.stringify(__return))
    })
  })
  
  //Delete
  router.delete('/try_delete', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    let {param1, param2} = req.body
    
    __return['data'] = {
      param1: param1,
      param2: param2,
      randomValue: Math.random(),
    }
    __return['message'] = 'DELETE was successful!'
    res.end(JSON.stringify(__return))
  })
  
  //Put
  router.put('/try_put', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    let {param1, param2} = req.body
    
    __return['data'] = {
      param1: param1,
      param2: param2,
      randomValue: Math.random(),
    }
    __return['message'] = 'PUT was successful!'
    res.end(JSON.stringify(__return))
  })
  
  //Get - test cache
  router.get('/test_cache1', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    let {param1, param2} = req.query
    
    __return['data'] = {
      param1: param1,
      param2: param2,
      randomValue: Math.random(),
    }
    __return['message'] = 'Get test cache render was successful!'
    res.end(JSON.stringify(__return))
  })
  
  //Post - test cache
  router.post('/test_cache2', (req, res) => {
    let __return = {
      is_success: true,
      data: {},
      message: null,
    }
    let {param1, param2} = req.query
    let {planet1, planet2} = req.body
    
    __return['data'] = [
      {
        param1: param1,
        param2: param2,
        randomValue: Math.random(),
      },
      {
        planet1: planet1,
        planet2: planet2,
        randomValue: Math.random(),
      },
    ]
    __return['message'] = 'Post test cache render was successful!'
    res.end(JSON.stringify(__return))
  })
  
  return router
}
