utils = require('./utils')
config = require('./config')
https = require('https')
request = require('request')
cookieJar = request.jar()
fs = require('fs')

api = module.exports =
  baseUrl: ->
    'https://' + config.env + '/' + config.org + '/v2/'

  call: (method, url, options, callback) ->
    if typeof options == 'function'
      callback = options
      options = {}
    baseRequest = request.defaults(
      headers: 'Medable-Client-Key': config.apiKey
      xhrFields: withCredentials: true
      json: true
      jar: cookieJar)
    options.url = url
    options.method = method
    baseRequest options, (error, response, body) ->
      if error
        callback error
      else
        if response.statusCode != 200
          callback body
        else
          callback null, response, body
      return

  get: (url, options, callback) ->
    @call 'GET', url, options, callback

  post: (url, payload, options, callback) ->
    if typeof options == 'function'
      callback = options
      options = {}
    options.body = payload
    @call 'POST', url, options, callback

  put: (url, payload, options, callback) ->
    if typeof options == 'function'
      callback = options
      options = {}
    options.body = payload
    @call 'PUT', url, options, callback
