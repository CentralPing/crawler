var util = require('util');
var request = require('request');
var cheerio = require('cheerio');
var q = require('q');
var _ = require('lodash-node/modern');
var charset = require('charset');
var jschardet = require('jschardet');
var iconv = require('iconv-lite');

// https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding
iconv.skipDecodeWarning = true;

module.exports.crawl = crawl;
module.exports.scrape = scrape;
module.exports.trimText = trimText;

var options = module.exports.options = {
  $: cheerio.load,
  logger: {
    warn: console.warn,
    error: console.error
  }
};

function crawl(req, parser, detailParser) {
  return scrape(req, parser, detailParser).then(function (results) {
    if (results.nextPage !== undefined) {
      return crawl({url: results.nextPage}, parser, detailParser).then(function (items) {
        return [].concat(results.items, items);
      });
    }

    return results.items;
  });
}

function scrape(req, parser, detailParser) {
  var deferred = q.defer();

  options.logger.warn('Requesting page: %s', req.url);

  req = _.merge({encoding: 'binary'}, req);

  request(req, function (err, resp, body) {
    if (err) { return deferred.reject(err); }
    if (resp.statusCode !== 200) { return deferred.reject(new Error(util.format('Request for `%s` returned: %d', req.url, resp.statusCode))); }

    var results = parser(options.$(decodeBody(resp, body)));

    if (detailParser === undefined) {
      return deferred.resolve(results);
    }

    return q.allSettled(results.items.map(function (item) {
      if (item.srcURL === undefined) { return {}; }

      return scrape({url: item.srcUrl}, detailParser);
    })).then(function (details) {
      details.forEach(function (result, i) {
        if (result.state === 'fulfilled') {
          _.merge(results.items[i], result.value);
        }
        else {
          options.logger.error(result.reason);
        }
      });

      return deferred.resolve({
        nextPage: results.nextPage,
        items: results.items
      });
    });
  });

  return deferred.promise;
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
