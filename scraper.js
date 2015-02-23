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
  nextPagePath: 'nextPage',
  itemsPath: 'items',
  srcUrlPath: 'srcUrl',
  detailBatchLimit: 10,
  logger: {
    warn: console.warn,
    error: console.error
  }
};

function crawl(req, parser, detailParser) {
  return scrape(req, parser, detailParser).then(function (results) {
    if (results[options.nextPagePath] !== undefined) {
      return crawl({url: results[options.nextPagePath]}, parser, detailParser).then(function (items) {
        return [].concat(results[options.itemsPath], items);
      });
    }

    return results[options.itemsPath];
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

    if (detailParser === undefined || !_.isArray(results[options.itemsPath])) {
      return deferred.resolve(results);
    }

    return detailBatch(results[options.itemsPath], detailParser, 0).then(function () {
      return deferred.resolve(results);
    });
  });

  return deferred.promise;
}

function detailBatch(items, parser, start) {
  var end = start + options.detailBatchLimit;
  var batch = items.slice(start, end);

  return q.allSettled(batch.map(function (item) {
    if (item[options.srcUrlPath] === undefined) { return {}; }

    return scrape({url: item[options.srcUrlPath]}, parser);
  })).then(function (details) {
    details.forEach(function (result, i) {
      if (result.state === 'fulfilled') {
        _.merge(batch[i], result.value);
      }
      else {
        options.logger.error(result.reason);
      }
    });

    return (end < items.length) ? detailBatch(items, parser, end) : items;
  });
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
