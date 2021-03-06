crawler
====================

[![Greenkeeper badge](https://badges.greenkeeper.io/CentralPing/crawler.svg)](https://greenkeeper.io/)

[ ![Codeship Status for CentralPing/crawler](https://codeship.com/projects/d139b670-a0f1-0132-c300-3e3486fb28a9/status?branch=master)](https://codeship.com/projects/65568)
[ ![Code Climate for CentralPing/crawler](https://codeclimate.com/github/CentralPing/crawler/badges/gpa.svg)](https://codeclimate.com/github/CentralPing/crawler)
[ ![Dependency Status for CentralPing/crawler](https://david-dm.org/CentralPing/crawler.svg)](https://david-dm.org/CentralPing/crawler)

A simple website crawler with `$` selector-type syntax.

## Introduction

Provides an instance of a `queue` that will iterate concurrently until all items have been processed. Each iteration calls the provided handler with a [jQuery](http://api.jquery.com/) like `$` selector syntax for ease of accessing any relevant DOM nodes. A helper method `trimText` is also provided for a common task of selecting and trimming a node's text value. Crawling a website will continue for as long as items are queued.

## Installation

`npm i --save CentralPing/crawler`

## API Reference
**Example**  
```js
var crawler = require('crawler');
var queue = crawler.queue(options);
var requests = []; // Array of request objects

// Start crawling
queue.push(requests, function callback(error, response, $body, request) {
  // Do something
});
```
<a name="module_crawler..queue"></a>
### crawler~queue([options], [options.$]) ⇒ <code>function</code>
**Kind**: inner method of <code>[crawler](#module_crawler)</code>  
**Returns**: <code>function</code> - A queue managed by [async](https://github.com/caolan/async)'s [queue](https://github.com/caolan/async#queue).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  |  |
| [options.userAgent] | <code>string</code> |  | This value is used to set the `User Agent` in the request header. Defaults to *Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36* |
| [options.maxRedirects] | <code>number</code> | <code>5</code> | The maximum number of redirects to follow. |
| [options.maxConcurrency] | <code>number</code> | <code>10</code> | An integer for determining how many requests should be run in parallel. |
| [options.$] | <code>object</code> |  | A jQuery like DOM selector. Defaults to using [cheerio](http://cheeriojs.github.io/cheerio/). *Any alternative option must be a function that takes the raw body as an argument* |

<a name="module_crawler..trimText"></a>
### crawler~trimText($node) ⇒ <code>string</code> &#124; <code>undefined</code>
Extract and trims text from $node

**Kind**: inner method of <code>[crawler](#module_crawler)</code>  

| Param | Type | Description |
| --- | --- | --- |
| $node | <code>object</code> | jQuery-like node object |


### Requests
One or more requests can be pushed onto the queue at a time. Each request must be an object with a `req` property that contains a valid [options object or URL](https://github.com/request/request#requestoptions-callback) for a [request](https://github.com/request/request). Any global optons will be replaced by any matching request options (e.g. `maxRedirects`). The request object will also be passed back to the callback handler as the 4th argument.

```js
// Single requests
queue.push({req: 'http://www.github.com'}, callback);
queue.push({req: {url: 'http://www.cnn.com', maxRedirects: 10}}, callback);

// Multiple requests
queue.push([
  {req: 'http://www.github.com'},
  {req: {url: 'http://www.cnn.com', maxRedirects: 10}}
], callback);
```

### Callback
The callback is executed once per every request. Four arguments are passed to the callback: `(error, response, $body, request)`.
* **error**: An error object from the request.
* **response**: The raw response object from the request.
* **$body**: The DOM of the response HTML.
* **request**: The original queued request object.

# License

Apache 2.0
