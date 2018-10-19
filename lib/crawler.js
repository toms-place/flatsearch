const Flats = require('./flats');
const CronJob = require('cron').CronJob;
const rp = require('request-promise');
const {
  JSDOM
} = require('jsdom');

class Crawler {
  constructor(cronTime) {
    this.cronTime = cronTime;
    this.flats = new Flats();
  }
  crawlSites() {
    let promises = [];

    //options
    let neueslebenURL;
    let ebgURL;
    if (process.env.NODE_ENV == 'dev') {
      neueslebenURL = 'http://localhost:8080/neuesleben';
      ebgURL = 'http://localhost:8080/ebg';
    } else {
      neueslebenURL = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/'
      ebgURL = 'http://www.ebg-wohnen.at/Suche.aspx';
    }

    //neuesleben
    let neuesleben = {
      'url': neueslebenURL,
      resolveWithFullResponse: true
    };

    //options for request
    let ebg = {
      'url': ebgURL,
      resolveWithFullResponse: true
    };

    //neuesleben
    promises.push(rp(neuesleben).then((res, err) => {
      if (err) {
        let date = new Date();
        return console.error('error requesting header:', date, err);
      } else {

        return;
      }
    }).catch((err) => {
      console.log('nl crawl err');
    }));

    //nl
    rp(neuesleben).then((res, err) => {
      let promise = new Promise((resolve) => {
        if (err) {
          return console.error('error requesting header:', err);
        } else {
          let dom = new JSDOM(res.body);
          let angebot = dom.window.document.querySelectorAll('.unstyled');
          for (let i = 0; i < angebot.length; i++) {
            this.flats.flats[angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML] = {
              id: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML,
              title: angebot[i].querySelectorAll('.title')[0].innerHTML.trim(),
              district: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[0],
              city: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[1],
              address: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML,
              link: 'https://www.wohnen.at' + angebot[i].href,
              amount: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
              status: angebot[i].querySelectorAll('.tile-ribbon')[0].innerHTML.trim()
            }
          }
        }
        resolve();
      });
      promises.push(promise);
    }).catch((err) => {
      console.log('nl crawl err', err);
    });

    //ebg
    rp(ebg).then((res, err) => {
      if (err) {
        return console.error('error requesting header:', err);
      } else {
        let promise = new Promise((resolve) => {
          let dom = new JSDOM(res.body);
          let angebot = dom.window.document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');

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
            link = 'http://www.ebg-wohnen.at/' + angebot[i].getAttribute("onclick").split('\'')[1];
            if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
              id = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1];
              address = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1];
              district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
              city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
              title = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1];
              amount = 1;
              rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
            } else {
              id = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
              address = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
              title = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
              district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
              city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
              amount = parseInt(angebot[i].querySelectorAll('.numberOfFlats')[0].innerHTML);;
              rooms = "deeper search necessary"
            }
            this.flats.flats[id] = {
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
          resolve();
        });
        promises.push(promise);
      }
    }).catch((err) => {
      console.log('ebg crawl err', err);
    });
    return promises;
  }
  startCrawl() {
    var self = this;

    Promise.all(this.crawlSites()).then(() => {
      self.flats.compare();
    });
  }
  startJob() {
    var self = this;

    if (process.env.NODE_ENV == 'dev') {
      setTimeout(() => {
        self.startCrawl();
        self.startJob();
      }, 10000);
    } else {
      const job = new CronJob(self.cronTime, function () {
        self.startCrawl();
      });
      job.start();
    }
  }
}

module.exports = Crawler;