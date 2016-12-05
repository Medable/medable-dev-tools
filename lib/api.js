var utils       = require('./utils.js'),
    config      = require('./config.js'),
    https       = require('https'),
    request     = require('request'),
    cookieJar   = request.jar(),
    fs          = require('fs'),
    testConf    = require('./config.js');

var api = module.exports = {

    baseUrl: function() {
      return 'https://' + config.env + '/' + config.org + '/v2/';
    },
    
    call: function(method, url, options, callback) {
        console.log(config.env);
        if (typeof(options) == 'function') {
            callback = options;
            options = {};
        }

        var baseRequest = request.defaults({
                            headers: { "Medable-Client-Key": config.apiKey},
                            xhrFields: { withCredentials: true },
                            json: true,
                            jar: cookieJar
                          });

        options.url = url;
        options.method = method;
        return baseRequest(options, function (error, response, body) {
            if(error) {
              callback(error);
            } else {
              if(response.statusCode!=200){
                callback(body);
              } else {
                callback(null, response, body);
              }
            }
        });
    },

    get: function(url, options, callback) {
        return this.call('GET', url, options, callback);
    },

    post: function(url, payload, options, callback) {
        if (typeof(options) == 'function') {
            callback = options;
            options = {};
        }
        options.body = payload;
        return this.call('POST', url, options, callback);
    },

    put: function(url, payload, options, callback) {
        if (typeof(options) == 'function') {
            callback = options;
            options = {};
        }
        options.body = payload;
        return this.call('PUT', url, options, callback);
    }
};
