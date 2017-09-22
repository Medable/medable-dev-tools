'use strict';

const config  = require ('./config'),
      request = require('request'),
      cookieJar = request.jar(),
      chromeLogger = require('./chrome-logger');

module.exports = {

    baseUrl() {
        return `https://${config.env}/${config.org}/v2/`;
    },

    call(method, url, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        const headers = {
            'Medable-Client-Key': config.apiKey
        };
        if (config.accessToken) {
            headers.Authorization = `Bearer ${config.accessToken}`;
        }

        let baseRequest = request.defaults({
            headers: headers,
            xhrFields: { withCredentials: true
            },
            json: true,
             strictSSL: false,
            jar: cookieJar});
        options.url = url;
        options.method = method;
        return baseRequest(options, function(error, response, body) {
            chromeLogger(response);
            if (error) {
                callback(error);
            } else {
                if (response.statusCode !== 200) {
                    callback(body);
                } else {
                    callback(null, response, body);
                }
            }
        });
    },

    get(url, options, callback) {
        return this.call('GET', url, options, callback);
    },

    post(url, payload, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        options.body = payload;
        return this.call('POST', url, options, callback);
    },

    put(url, payload, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        options.body = payload;
        return this.call('PUT', url, options, callback);
    }
};
