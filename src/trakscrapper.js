const cheerio = require('cheerio')
const axios = require('axios')
const moment = require('moment')
const accounting = require('accounting')

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

function parseBody ($, headers, table) {
  const result = $(table).find('tr').slice(1)
                        .map(function () {
                          const td = $(this).find('td')
                          const obj = {}
                          td.each(function (i) {
                            const el = $(this)
                            if (el.find('a').length) {
                              obj[`link_${headers[i]}`] = el.find('a')
                                                           .attr('href')
                            }
                            let val = $(this).text()
                            if (/\d{2}\/\d{1,2}\/\d{4}/.exec(val)) {
                              val = moment(val, 'DD/MM/YYYY').toISOString()
                            }
                            if (headers[i].indexOf('Amount') > -1) {
                              val = accounting.unformat(val)
                            }

                            if (headers[i].indexOf('Investors’ Name') > -1) {
                              val = val.split(',')
                                       .filter(d => d)
                                       .map(d => d.trim())
                            }
                            obj[headers[i]] = val
                          })
                          return obj
                        })
                        .get()
  return result
}

function parseHeaders ($, table) {
  return $(table).find('tr').first().find('td')
                        .map(function (i, el) {
                          return $(el).text()
                        })
                        .get()
}

function parseTable ($, table) {
  var headers = parseHeaders($, table)
  var body = parseBody($, headers, table)
  return body
}

function parseHTML (html) {
  const $ = cheerio.load(html)
  const result = $('table').map(function tableMapper(i, tableEl) {
    return parseTable($, tableEl)
  }).get()
  return result
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

module.exports = {
  scrape,
  parseHTML,
  getUrls
}