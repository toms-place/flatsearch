const Crawler = require('./crawler');
const rp = require("request-promise");
const {
  JSDOM
} = require('jsdom');
var sortBy = require('lodash.sortby');

class Crawler_nl extends Crawler {
  constructor(url, cronTime, initOut) {
    super(url, cronTime, initOut)
    this.flats = []
    this.tempFlats = []
    this.changedFlats = []
  }
  crawl() {
    //clear this.flats on init
    this.flats = [];

    //options for request
    var options = {
      'url': this.url,
      resolveWithFullResponse: true
    };

    return rp(options).then((res, err) => {
      if (err) {
        let date = new Date();
        return console.error('error requesting header:', date, err);
      } else {
        var dom = new JSDOM(res.body);
        var angebot = dom.window.document.querySelectorAll('.unstyled');
        for (var i = 0; i < angebot.length; i++) {
          this.flats[i] = {
            id: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML,
            title: angebot[i].querySelectorAll('.title')[0].innerHTML.trim(),
            district: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[0],
            city: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[1],
            address: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML,
            link: 'https://www.wohnen.at/' + angebot[i].href,
            amount: angebot[i].querySelectorAll('.large-font')[0].innerHTML,
            status: angebot[i].querySelectorAll('.tile-ribbon')[0].innerHTML.trim()
          }
        }
        this.flats = sortBy(this.flats, 'id');
        return;
      }
    });
  }
}

module.exports = Crawler_nl;