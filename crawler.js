'use strict';
/* jshint node: true */

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('lodash-node/modern');
var charset = require('charset');
var jschardet = require('jschardet');
var iconv = require('iconv-lite');

// https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding
iconv.skipDecodeWarning = true;

module.exports.queue = queue;
module.exports.trimText = trimText;


/**
 * @module crawler
 * @example
```js
var crawler = require('crawler');
var queue = crawler.queue(options);
var requests = []; // Array of request objects

// Start crawling
queue.push(requests, function callback(error, response, $body, request) {
  // Do something
});
```
*/

/**
 * @param {object} [options]
 * @param {string} [options.userAgent] - This value is used to set the `User Agent` in the request header. Defaults to *Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36*
 * @param {number} [options.maxRedirects=5] - The maximum number of redirects to follow.
 * @param {number} [options.maxConcurrency=10] - An integer for determining how many requests should be run in parallel.
 * @param {object} [options.$] - A jQuery like DOM selector. Defaults to using [cheerio](http://cheeriojs.github.io/cheerio/). *Any alternative option must be a function that takes the raw body as an argument*
 * @return {function} A queue managed by [async](https://github.com/caolan/async)'s [queue](https://github.com/caolan/async#queue).
 */
function queue(options) {
  options = _.merge({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
    maxRedirects: 5,
    maxConcurrency: 10,
    $: cheerio.load
  }, options);

  return async.queue(function (task, done) {
    var req = _.merge({
      encoding: 'binary',
      maxRedirects: options.maxRedirects,
      headers: {
        'User-Agent': options.userAgent
      }
    }, _.isObject(task.req) ? task.req : {url: task.req});

    request(req, function (err, resp, body) {
      if (!err && resp.statusCode === 200) {
        body = options.$(decodeBody(resp, body));
      }

      done(err, resp, body, task);
    });
  }, options.maxConcurrency);
}

/**
 * Extract and trims text from $node
 * @param {object} $node - jQuery-like node object
 * @return {string|undefined}
*/
function trimText($node) {
  var str = $node.text();

  return _.isString(str) ? str.trim() : undefined;
}

/**
 * Decodes body based on encoding in header or detected from the body itself.
 * @param {object} resp - Request response object.
 * @param {string} body - Request response body.
 * @return {string}
 * @private
*/
function decodeBody(resp, body) {
  var enc = charset(resp.headers, body) || jschardet.detect(body).encoding.toLowerCase();

  if (enc !== 'utf-8') {
    body = iconv.decode(body, enc);
  }

  return body;
}
