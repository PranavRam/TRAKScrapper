const cheerio = require('cheerio')
const moment = require('moment-timezone')
const {unformat} = require('accounting')

var HTMLParser = function (html) {
  this.$ = cheerio.load(html)
  this.dateFormatMatcher = /\d{2}\/\d{1,2}\/\d{4}/
  this.dateFormat = 'DD/MM/YYYY'
  this.timezone = 'Asia/Kolkata'
}

HTMLParser.prototype.parse = function () {
  var $ = this.$
  var result = $('table').map((i, tableEl) => {
    return this.parseTable(tableEl)
  }).get()
  return result
}

HTMLParser.prototype.generateKey = function (datum) {
  var keyHeaders = ['Sr. No.', 'Date (dd/mm/yyyy)', 'Startup Name']
  return keyHeaders.map(header => datum[header].value).join('-')
}

HTMLParser.prototype.parseColumn = function (header, el) {
  var parser = this
  var datum = {}
  var val = el.text()
  if (el.find('a').length) {
    datum[`link`] = el.find('a')
                                .attr('href')
  }
  if (parser.dateFormatMatcher.exec(val)) {
    val = moment.tz(val, parser.dateFormat, parser.timezone).toISOString()
  }

  if (header.indexOf('Amount') > -1) {
    val = unformat(val)
  }

  if (header.indexOf('Investors’ Name') > -1) {
    val = val.split(',')
      .filter(d => d)
      .map(d => d.trim())
  }
  datum.value = val
  return datum
}

HTMLParser.prototype.parseRows = function (row, headers) {
  var parser = this
  var $ = parser.$
  var datum = {}
  row.find('td').each(function loopColumnDatum (i) {
    datum[headers[i]] = parser.parseColumn(headers[i], $(this))
  })
  datum['key'] = parser.generateKey(datum)
  return datum
}

HTMLParser.prototype.parseBody = function (headers, table) {
  var parser = this
  var $ = parser.$
  var result = $(table).find('tr').slice(1)
                        .map(function parseRows () { return parser.parseRows($(this), headers) })
                        .get()
  return result
}

HTMLParser.prototype.parseHeaders = function (table) {
  var $ = this.$
  return $(table).find('tr').first().find('td')
                        .map(function mapHeader (i, el) {
                          return $(el).text()
                        })
                        .get()
}

HTMLParser.prototype.parseTable = function (table) {
  var $ = this.$
  var headers = this.parseHeaders(table)
  var result = this.parseBody(headers, table)
  result = result.filter(function filterResults (datum) {
    return datum['Startup Name'].value
  })
  return result
}

module.exports = HTMLParser
