const Flats = require('./flats');
const CronJob = require('cron').CronJob;
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;


class Crawler {
  constructor(cronTime) {
    this.cronTime = cronTime;
    this.flats = new Flats();
  }
  async startCrawl() {
    await this.crawlSites();
    this.flats.compare();
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
  async crawlSites() {

    //clear all flats on init
    this.flats.flats = {};

    //env options
    let neueslebenURL;
    let ebgURL;
    let szbURL;
    let suURL;
    let egwURL;
    let friedenURL;

    if (process.env.NODE_ENV == 'dev') {
      neueslebenURL = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/';
      ebgURL = 'http://localhost:8080/ebg';
      szbURL = 'http://localhost:8080/szb';
      suURL = 'http://localhost:8080/su';
      egwURL = 'http://localhost:8080/egw';
      friedenURL = "http://www.frieden.at/wohnungsangebot";
    } else {
      neueslebenURL = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/'
      ebgURL = 'http://www.ebg-wohnen.at/Suche.aspx';
      szbURL = 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/'
      suURL = 'http://www.siedlungsunion.at/wohnen/sofort';
      egwURL = 'http://www.egw.at/immobilien/bestands-wohnungen/miete/';
      friedenURL = 'http://www.frieden.at/wohnungsangebot';
    }

    await crawlNL(neueslebenURL, this);
    await crawlEGW(egwURL, this);
    await crawlEBG(ebgURL, this);
    await crawlSZB(szbURL, this);
    await crawlSU(suURL, this);

    //needs improvement
    //await crawlFRIEDEN(friedenURL, this);


  }
}

module.exports = Crawler;

async function crawlEBG(url, self) {
  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then((res, err) => {
    if (process.env.NODE_ENV == 'dev') {
      console.log("requested ebg")
    }

    if (err) {
      console.error('error requesting header:', err);
    } else {
      let dom = new JSDOM(res.body);
      let angebot = dom.window.document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');

      let key;
      let district;
      let address;
      let city;
      let link;
      let amount;
      let rooms;
      let costs;

      for (let i = 0; i < angebot.length; i++) {
        link = 'http://www.ebg-wohnen.at/' + angebot[i].getAttribute("onclick").split('\'')[1];
        if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
          key = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1].trim();
          address = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1].trim();
          district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
          city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
          amount = 1;
          rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
        } else {
          key = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
          address = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
          district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
          city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
          amount = parseInt(angebot[i].querySelectorAll('.numberOfFlats')[0].innerHTML);;
          rooms = "deeper search necessary"
        }
        self.flats.flats[key] = {
          district: parseInt(district),
          address: address,
          city: city,
          link: link,
          amount: amount,
          rooms: rooms,
          status: 'no status',
          costs: 'not found',
          funds: 'not found'
        }
      }
    }
  }).catch((err) => {
    console.log('ebg crawl err', err);
  });
}

async function crawlNL(url, self) {
  let promises = [];

  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then(async (res, err) => {
    if (process.env.NODE_ENV == 'dev') {
      console.log("requested nl")
    }

    if (err) {
      console.error('error requesting header:', err);
    } else {

      let dom = new JSDOM(res.body);
      let angebot = dom.window.document.querySelectorAll('.unstyled');
      for (let i = 0; i < angebot.length; i++) {

        var title = angebot[i].querySelectorAll('.title')[0].innerHTML.trim();

        promises.push(rp({
          'url': 'https://www.wohnen.at' + angebot[i].href,
          resolveWithFullResponse: true
        }).then((res, err) => {
          if (process.env.NODE_ENV == 'dev') {
            console.log("requested nl second")
          }

          if (err) {
            console.error('error requesting header:', err);
          } else {
            let dom = new JSDOM(res.body);

            if (dom.window.document.querySelectorAll('.units-table')[0]) {
              let angebotInner = dom.window.document.querySelectorAll('.units-table')[0].querySelectorAll('.row');
              let [district, city] = dom.window.document.querySelectorAll('.building-page')[0].querySelectorAll('h1')[0].innerHTML.split(',')[0].split(' ');

              for (let x = 0; x < angebotInner.length; x++) {
                let a = angebotInner[x].querySelectorAll('div')[0];
                let funds;
                if (a.querySelectorAll('.financing-option-value')[0]) {
                  funds = a.querySelectorAll('.financing-option-value')[0].innerHTML;
                }
                self.flats.flats[a.querySelectorAll('.address')[0].innerHTML + ' - ' + title] = {
                  address: a.querySelectorAll('.address')[0].innerHTML,
                  district: parseInt(district),
                  city: city,
                  link: 'https://www.wohnen.at' + a.getAttribute("onclick").split('\'')[1],
                  amount: 1,
                  rooms: parseInt(a.querySelectorAll('.room')[0].innerHTML),
                  status: a.querySelectorAll('.legalForm')[0].innerHTML,
                  funds: funds,
                  size: a.querySelectorAll('.area')[0].innerHTML,
                  costs: 'not found'
                }
              }
            }
          }
        }).catch((err) => {
          console.log('nl inner crawl err', err);
        }));

        /*
        Overview scrape..

                self.flats.flats[angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML] = {
                  title: angebot[i].querySelectorAll('.title')[0].innerHTML.trim(),
                  district: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[0],
                  city: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML.split(" ")[1],
                  address: angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML,
                  link: 'https://www.wohnen.at' + angebot[i].href,
                  amount: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
                  status: angebot[i].querySelectorAll('.tile-ribbon')[0].innerHTML.trim()
                }
        */

      }
    }
  }).catch((err) => {
    console.log('nl crawl err', err);
  });

  await Promise.all(promises);

}


async function crawlSZB(url, self) {
  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then((res, err) => {
    if (process.env.NODE_ENV == 'dev') {
      console.log("requested szb")
    }

    if (err) {
      console.error('error requesting header:', err);
    } else {
      let dom = new JSDOM(res.body);
      let angebot;
      if (dom.window.document.querySelectorAll('.mobile-table')[0]) {
        angebot = dom.window.document.querySelectorAll('.mobile-table')[0].querySelectorAll('tr');

        for (let i = 1; i < angebot.length; i++) {
          self.flats.flats[angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1].trim()] = {
            district: parseInt(angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[0]),
            address: angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1],
            city: angebot[i].querySelectorAll('td')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[1],
            link: 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/',
            amount: 1,
            rooms: parseInt(angebot[i].querySelectorAll('td')[1].innerHTML),
            status: 'no status',
            costs: angebot[i].querySelectorAll('td')[3].innerHTML,
            funds: angebot[i].querySelectorAll('td')[2].innerHTML
          }
        }
      }
    }
  }).catch((err) => {
    console.log('szb crawl err', err);
  });
}


async function crawlSU(url, self) {
  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then((res, err) => {
    if (process.env.NODE_ENV == 'dev') {
      console.log("requested su")
    }

    if (err) {
      console.error('error requesting header:', err);
    } else {
      let dom = new JSDOM(res.body);
      let angebot = dom.window.document.querySelectorAll('article');

      for (let i = 0; i < angebot.length; i++) {
        self.flats.flats[angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1].trim()] = {
          district: parseInt(angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[0]),
          address: angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[1].trim(),
          city: angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].innerHTML.trim().split(',')[0].split(' ')[1],
          link: 'http://www.siedlungsunion.at' + angebot[i].querySelectorAll('.settlers-wohnen-title')[0].querySelectorAll('a')[0].href,
          amount: 1,
          rooms: parseInt(angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[0].innerHTML.split(' ')[0]),
          status: 'no status',
          costs: angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[2].textContent.split(' ')[0],
          size: angebot[i].querySelectorAll('.settlers-wohnen-properities')[0].querySelectorAll('.uk-text-bold')[1].textContent,
          funds: 'not found'
        }
      }
    }
  }).catch((err) => {
    console.log('su crawl err', err);
  });
}

async function crawlEGW(url, self) {
  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then((res, err) => {
    if (process.env.NODE_ENV == 'dev') {
      console.log("requested egw")
    }

    if (err) {
      console.error('error requesting header:', err);
    } else {
      let dom = new JSDOM(res.body);
      let angebot = dom.window.document.querySelectorAll('.immobilien')[0].querySelectorAll('tr');

      for (let i = 1; i < angebot.length; i++) {
        let [destination, ...rest] = angebot[i].querySelectorAll('a')[0].innerHTML.split(",");
        let address = rest.join(',').trim();

        self.flats.flats[address] = {
          district: parseInt(destination.split(' ')[0]),
          address: address,
          city: destination.split(' ')[1],
          link: angebot[i].querySelectorAll('a')[0].href,
          amount: 1,
          rooms: parseInt(angebot[i].querySelectorAll('td')[2].innerHTML),
          status: 'no status',
          size: angebot[i].querySelectorAll('td')[1].textContent,
          costs: angebot[i].querySelectorAll('td')[4].innerHTML.split(" ")[1],
          funds: angebot[i].querySelectorAll('td')[3].innerHTML.split(" ")[1]
        }
      }
    }
  }).catch((err) => {
    console.log('su crawl err', err);
  });
}

/**
 * infinite scroll - needs improvement
 *
 * @param {*} url
 * @param {*} self
 *
async function crawlFRIEDEN(url, self) {
  console.log("start");
  await rp({
    'url': url,
    resolveWithFullResponse: true
  }).then((res, err) => {
    console.log("requested");

    if (err) {
      console.error('error requesting header:', err);
    } else {


        let dom = new JSDOM(res.body + `<script>      window.scrollTo(0,document.body.scrollHeight);        </script>`, {
          runScripts: "dangerously"
        });
        let angebot = dom.window.document.querySelectorAll('.header');





        let friedenFlats = {};
        for (let i = 0; i < angebot.length; i++) {

          console.log(angebot[i]);
          //let [destination, ...rest] = angebot[i].nextAll();
          //let address = rest.join(',').trim();



          friedenFlats[i] = {
            district: '',
            address: '',
            city: '',
            link: '',
            amount: 1,
            rooms: parseInt(),
            status: 'no status',
            costs: parseFloat(),
            funds: '',
            size: ''
          }
          //console.log(angebot.nextAll());
        }
        //console.log(friedenFlats);
    }

  }).catch((err) => {
    console.log('frieden crawl err', err);
  });
}
*/

/*


          district: '',
          address: '',
          city: '',
          link: '',
          amount: 1,
          rooms: parseInt(),
          status: 'no status',
          costs: parseFloat(),
          funds: '',
          size: ''

*/