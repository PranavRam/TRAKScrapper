var test = require('tape')
var fs = require('fs')
var testPage = fs.readFileSync('./tests/test.html')
const TRAKScrapper = require('../src/trakscrapper')
const HTMLParser = require('../src/trakscrapper').HTMLParser

test('A passing test', (assert) => {
  assert.pass('This test will pass.')

  assert.end()
})

test('TRAKScrapper has methods', (t) => {
  t.ok(typeof TRAKScrapper.scrape === 'function')
  t.ok(typeof TRAKScrapper.crawl === 'function')
  t.ok(typeof TRAKScrapper.getUrls === 'function')
  t.ok(typeof TRAKScrapper.HTMLParser === 'function')
  t.end()
})

test('TRAKScrapper parseHTML', (t) => {
  // var htmlParser = new HTMLParser(testPage)
  // console.log(htmlParser.parse())
  t.end()
})

test('TRAKScrapper crawl', (t) => {
  return TRAKScrapper.crawl('http://trak.in/india-startup-funding-investment-2015/')
  .then(result => {
    console.log(result)
    t.end()
  })
})
