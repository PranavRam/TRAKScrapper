var test = require('tape');
var fs = require('fs');
var testPage = fs.readFileSync('./tests/test.html')
const TRAKScrapper = require('../src/trakscrapper')

test('A passing test', (assert) => {

  assert.pass('This test will pass.');

  assert.end();
});

test('TRAKScrapper has methods', (t) => {
  
  t.ok(typeof TRAKScrapper.scrape === 'function')
  t.ok(typeof TRAKScrapper.getUrls === 'function')
  t.ok(typeof TRAKScrapper.parseHTML === 'function')
  t.end()
});

test('TRAKScrapper parseHTML', (t) => {
  
  TRAKScrapper.parseHTML(testPage)
  t.end()
});