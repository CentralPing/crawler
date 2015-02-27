var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('lodash-node/modern');
var charset = require('charset');
var jschardet = require('jschardet');
var iconv = require('iconv-lite');

// https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding
iconv.skipDecodeWarning = true;

module.exports.crawler = crawler;
module.exports.trimText = trimText;

function crawler(options) {
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
    }, task.req);

    request(req, function (err, resp, body) {
      if (!err && resp.statusCode === 200) {
        body = options.$(decodeBody(resp, body));
      }

      done(err, resp, body, task);
    });
  }, options.maxConcurrency);
}

function trimText($el) {
  var str = $el.text();

  return _.isString(str) ? str.trim() : undefined;
}

function decodeBody(resp, body) {
  var enc = charset(resp.headers, body) || jschardet.detect(body).encoding.toLowerCase();

  if (enc !== 'utf-8') {
    body = iconv.decode(body, enc);
  }

  return body;
}
