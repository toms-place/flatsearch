const Crawler = require('./crawler');
const rp = require("request-promise");
const {
  JSDOM
} = require('jsdom');
var sortBy = require('lodash.sortby');

class Crawler_ebg extends Crawler {
  constructor(uri, cronTime, initOut) {
    super(uri, cronTime, initOut)
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
        return console.error('error requesting header:', err);
      } else {
        var dom = new JSDOM(res.body);
        var angebot = dom.window.document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');
        let id;
        let title;
        let district;
        let address;
        let city;
        let link;
        let amount;
        let rooms;
        let status;

        for (let i = 0; i < angebot.length; i++) {
          link = angebot[i].getAttribute("onclick").split('\'')[1];
          if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
            id = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1];
            address = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1];
            district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
            city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
            amount = 1;
            rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
          } else {
            id = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
            address = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
            district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
            city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
            amount = parseInt(angebot[i].querySelectorAll('.numberOfFlats')[0].innerHTML);;
            rooms = "deeper search necessary"
          }

          this.flats[i] = {
            id: id,
            title: title,
            district: district,
            address: address,
            city: city,
            link: link,
            amount: amount,
            rooms: rooms,
            status: status
          }
        }
        this.flats = sortBy(this.flats, 'id');
        return;
      }
    });

  };
}

module.exports = Crawler_ebg;