'use strict'

const {make} = require('../api/index')

module.exports = function () {
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
  
  /**
   * Example: allowCache
   * Supported action type: GET/POST/PUT/DELETE
   * */
  
  make({
    request: 'GET_CARS',//will be translated as 'cars/'(go through 'end-points.js' for more)
    queryString: '?start=2008&end=2010',//will be translated as 'cars/?start=2008&end=2010'
    data: {}, //No data is accepted for GET method
    allowCache: true,
    rebuildCache: false,
    allowDataCache: false,//Only availble for POST
    customEndPoint: null,
  }).then(response => {
    console.log('######################################')
    console.log(`request: 'GET_CARS',
    queryString: '?start=2008&end=2010',
    data: {},
    allowCache: true,
    rebuildCache: false,
    allowDataCache: false,
    customEndPoint: null`)
    console.log(response)
    console.log('######################################')
  })
  
  //Identical call to demonstrate the working of cache
  setTimeout(() => {
      make({
        request: 'GET_CARS',
        queryString: '?start=2008&end=2010',
        data: {},
        allowCache: true,
        rebuildCache: false,
        allowDataCache: false,
        customEndPoint: null,
      }).then(response => {
        console.log('######################################')
        console.log(`
        setTimeout Delay: 4000ms
        request: 'GET_CARS',
        queryString: '?start=2008&end=2010',
        data: {},
        allowCache: true,
        rebuildCache: false,
        allowDataCache: false,
        customEndPoint: null`)
        console.log(response)
        console.log('######################################')
      })
    },
    4000)
  
  //Different query string while the other parameters are same as above.
  //The cache will be different for different query string parameters
  setTimeout(() => {
      make({
        request: 'GET_CARS',
        queryString: '?start=1950&end=2000', //Query string is changed here
        data: {},
        allowCache: true,
        rebuildCache: false,
        allowDataCache: false,
        customEndPoint: null,
      }).then(response => {
        console.log('######################################')
        console.log(`
        setTimeout Delay: 6000
        request: 'GET_CARS',
        queryString: '?start=1950&end=2000', //Different query string
        data: {},
        allowCache: true,
        rebuildCache: false,
        allowDataCache: false,
        customEndPoint: null`)
        console.log(response)
        console.log('######################################')
      })
    },
    6000)
  
  /**
   * Example: rebuildCache
   * Supported action type: GET/POST/PUT/DELETE
   */
  
  //Cache will be rebuilt while rebuildCache is set true
  setTimeout(() => {
      make({
        request: 'GET_CARS',
        queryString: '?start=2008&end=2010',
        data: {},
        allowCache: true,
        rebuildCache: true, //set as true
        allowDataCache: false,
        customEndPoint: null,
      }).then(response => {
        console.log('######################################')
        console.log(`
        setTimeout Delay: 8000
        request: 'GET_CARS',
        queryString: '?start=2008&end=2010',
        data: {},
        allowCache: true,
        rebuildCache: true, //set as true
        allowDataCache: false,
        customEndPoint: null`)
        console.log(response)
        console.log('######################################')
      })
    },
    8000)
  
  /**
   * Example: allowDataCache
   * Supported action type: POST
   * */
  
  //Begin caching of body data
  make({
    request: 'POST_TEST2',//will be translated as 'test_cache2/'(go through 'end-points.js' for more)
    queryString: '?param1=12345&param2=abcdef',//will be translated as 'test_cache2/?param1=12345&param2=abcdef'
    data: {'planet1': 'mars', 'planet2': 'jupiter'},
    allowCache: true,
    rebuildCache: false,
    allowDataCache: true,
    customEndPoint: null,
  }).then(response => {
    console.log('######################################')
    console.log(`request: 'POST_TEST2',
    queryString: '?param1=12345&param2=abcdef',
    data: {'planet1': 'mars', 'planet2': 'jupiter'},
    allowCache: true,
    rebuildCache: false,
    allowDataCache: true,
    customEndPoint: null`)
    console.log(response)
    console.log('######################################')
  })
  
  // The above data is cached for the particular POST parameters
  // and the below function will refetch the same from the cache generated from the above code
  setTimeout(() => {
    make({
      request: 'POST_TEST2',
      queryString: '?param1=12345&param2=abcdef',
      data: {'planet1': 'mars', 'planet2': 'jupiter'}, //identical post body data as the above
      allowCache: true,
      rebuildCache: false,
      allowDataCache: true,
      customEndPoint: null,
    }).then(response => {
      console.log('######################################')
      console.log(`
      setTimeout Delay: 4000
      request: 'POST_TEST2',
      queryString: '?param1=12345&param2=abcdef',
      data: {'planet1': 'mars', 'planet2': 'jupiter'},
      allowCache: true,
      rebuildCache: false,
      allowDataCache: true,
      customEndPoint: null`)
      console.log(response)
      console.log('######################################')
    })
  }, 4000)
  
  //Different post body data while the other parameters are same as above.
  //The cache will be different for different post parameters
  setTimeout(() => {
    make({
      request: 'POST_TEST2',
      queryString: '?param1=12345&param2=abcdef',
      data: {'planet1': 'earth', 'planet2': 'venus'}, //different post body data from the above
      allowCache: true,
      rebuildCache: false,
      allowDataCache: true,
      customEndPoint: null,
    }).then(response => {
      console.log('######################################')
      console.log(`
      setTimeout Delay: 6000
      request: 'POST_TEST2',
      queryString: '?param1=12345&param2=abcdef',
      data: {'planet1': 'earth', 'planet2': 'venus'},
      allowCache: true,
      rebuildCache: false,
      allowDataCache: true,
      customEndPoint: null`)
      console.log(response)
      console.log('######################################')
    })
  }, 6000)
  
  /**
   * Example: customEndPoint
   * Supported action type: GET/POST/PUT/DELETE
   */
    //Some random end points
    //Note: apiUrl and method has to be supplied to customEndPoint as an object
  let _endPointDictionary = [
      {
        apiUrl: 'try_put',
        method: 'PUT',
      },
      {
        apiUrl: 'try_delete',
        method: 'DELETE',
      },
    ]
  
  make({
    request: 'CUSTOM_ENDPOINT_1',
    queryString: '?param1=12345&param2=abcdef',
    data: {},
    allowCache: true,
    rebuildCache: false,
    allowDataCache: false,
    customEndPoint: _endPointDictionary[0],
  }).then(response => {
    console.log('######################################')
    console.log(`
      request: 'CUSTOM_ENDPOINT_1',
      queryString: '?param1=12345&param2=abcdef',
      data: {},
      allowCache: true,
      rebuildCache: false,
      allowDataCache: false,
      customEndPoint: {
        apiUrl: 'try_put',
        method: 'PUT',
      }`)
    console.log(response)
    console.log('######################################')
  })
  
  make({
    request: 'CUSTOM_ENDPOINT_2',
    queryString: '?param1=12345&param2=abcdef',
    data: {},
    allowCache: true,
    rebuildCache: false,
    allowDataCache: false,
    customEndPoint: _endPointDictionary[1],
  }).then(response => {
    console.log('######################################')
    console.log(`
      request: 'CUSTOM_ENDPOINT_2',
      queryString: '?param1=12345&param2=abcdef',
      data: {},
      allowCache: true,
      rebuildCache: false,
      allowDataCache: false,
      customEndPoint: {
        apiUrl: 'try_delete',
        method: 'DELETE',
      }`)
    console.log(response)
    console.log('######################################')
  })
}
