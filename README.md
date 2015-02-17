scraper
====================

[ ![Codeship Status for CentralPing/scraper](https://codeship.com/projects/adcc36c0-9900-0132-73ac-365d53813970/status?branch=master)](https://codeship.com/projects/63541)

A simple website parser/crawler with `$` selector-type syntax.

## Introduction

Scraper provides two methods for extraction, `scrape` and `crawl`, as well as a helper method `trimText` and an `options` object for global configuration. Crawling a website will continue for as long as there is a `nextPage` property set that returns a valid response. Scraping a page can follow any secondary links (e.g. links for detail pages from a list page) if a `srcUrl` is specified for an item.

## Installation

`npm i --save CentralPing/scraper`

## API



### Example for crawling list pages

```JS
var scraper = require('scraper');

function parseListing($) {
  // Parse away with returned DOM

  return {
    nextPage: URL_FOR_FURTHER_PAGES, // `undefined` will stop crawl
    items: ARRAY_FOR_ITEMS_TO_ITERATE_OVER_FOR_DETAILS
      // must include a `srcUrl` property for requesting detail pages
  };
}

function parseDetails($) {
  // Parse away with returned DOM

  return OBJECT; // will be merged with the listing object for item;
}

scraper.crawl({
  url: 'http://www.google.com/search',
  qs: {
    q: 'bars'
  }
}, parseListing, parseDetails).then(function (bars) {
  // Do something with results
}).catch(function (err) {
  // Or handle error;
}).done();
```

### Example for scraping a page

```JS
var scraper = require('scraper');

function parse($) {
  // Parse away with returned DOM

  return OBJECT; // will be merged with the listing object for item;
}

scraper.scrape({
  url: 'http://www.google.com/search',
  qs: {
    q: 'bars'
  }
}, parse).then(function (bars) {
  // Do something with results
}).catch(function (err) {
  // Or handle error;
}).done();
```

## Notes
* URL requests are made with the [request](https://github.com/request/request) npm module.
* The `$` selector-type syntax utilizes [cheerio](http://cheeriojs.github.io/cheerio/) by default but can be configured by setting the `options.$` module global property.
