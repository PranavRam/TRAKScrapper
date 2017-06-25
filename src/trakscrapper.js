const axios = require('axios')
const cheerio = require('cheerio')
const Crawler = require('simplecrawler')

const HTMLParser = require('./HTMLParser')

const TRAK_URLS = [
  'http://trak.in/india-startup-funding-investment-2015/',
  'http://trak.in/india-startup-funding-investment-2015/january-2016/',
  'http://trak.in/india-startup-funding-investment-2015/february-2016/',
  'http://trak.in/india-startup-funding-investment-2015/indian-startup-funding-investment-chart-march-2016/',
  'http://trak.in/india-startup-funding-investment-2015/april-2016/',
  'http://trak.in/india-startup-funding-investment-2015/may-2016/',
  'http://trak.in/india-startup-funding-investment-2015/june-2016/',
  'http://trak.in/india-startup-funding-investment-2015/july-2016/',
  'http://trak.in/india-startup-funding-investment-2015/august-2016/',
  'http://trak.in/india-startup-funding-investment-2015/september-2016/',
  'http://trak.in/india-startup-funding-investment-2015/january-2015/',
  'http://trak.in/india-startup-funding-investment-2015/february-2015/',
  'http://trak.in/india-startup-funding-investment-2015/march-2015/',
  'http://trak.in/india-startup-funding-investment-2015/april-2015/',
  'http://trak.in/india-startup-funding-investment-2015/may-2015/',
  'http://trak.in/india-startup-funding-investment-2015/june-2015/',
  'http://trak.in/india-startup-funding-investment-2015/july-2015/',
  'http://trak.in/india-startup-funding-investment-2015/august-2015/',
  'http://trak.in/india-startup-funding-investment-2015/september-2015/',
  'http://trak.in/india-startup-funding-investment-2015/october-2015/',
  'http://trak.in/india-startup-funding-investment-2015/november-2015/',
  'http://trak.in/india-startup-funding-investment-2015/december-2015/'
]

function getUrls () {
  return TRAK_URLS
}

async function scrape (urls) {
  urls = urls || getUrls()
  var rawData = []
  try {
    rawData = await axios.all(urls.map(axios.get))
  } catch (e) {
    console.error(e)
  }
  return rawData.reduce((a, b) => a.concat(b))
}

function crawl (url) {
  return new Promise(function (resolve, reject) {
    var crawler = new Crawler(url)
    var results = []
    crawler.on('fetchcomplete', function (queueItem, responseBuffer, response) {
      var htmlParser = new HTMLParser(responseBuffer.toString('utf8'))
      results.push(htmlParser.parse())
    })
    crawler.on('complete', function (queueItem, resources) {
      console.log('Discovery Complete for: ' + url)
      var result = results.reduce((acc, val) => {
        return [...acc, ...val]
      }, [])
      console.log('Results', result.length)
      resolve(result)
    })
    crawler.maxDepth = 2
    crawler.discoverResources = function (buffer, queueItem) {
      var $ = cheerio.load(buffer.toString('utf8'))

      return $('a[href]')
                  .filter(function () {
                    var title = $(this).attr('title')
                    return title && title.includes('Funding Data')
                  })
                  .map(function () {
                    return $(this).attr('href')
                  })
                  .get()
    }
    crawler.start()
  })
}
module.exports = {
  scrape,
  crawl,
  HTMLParser,
  getUrls
}
