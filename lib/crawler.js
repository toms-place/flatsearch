const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
const Flat = require('./flat');
const logErr = require('./logger').logErr;

class Crawler {
  constructor() {
    this.flats = [];
  }
  async crawl() {
    console.log('startCrawl');

    //clear all flats on init
    this.flats = [];

    //env options
    let neueslebenURL;
    let ebgURL;
    let szbURL;
    let suURL;
    let egwURL;
    let friedenURL;
    let heimbauURL;

    if (process.env.NODE_ENV == 'dev') {
      neueslebenURL = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/';
      ebgURL = 'http://localhost:8080/ebg';
      szbURL = 'http://localhost:8080/szb';
      suURL = 'http://localhost:8080/su';
      egwURL = 'http://localhost:8080/egw';
      friedenURL = 'http://www.frieden.at/wohnungsangebot';
      heimbauURL = 'https://www.heimbau.at/wohnungen/neubau';
    } else {
      neueslebenURL = 'https://www.wohnen.at/angebot/unser-wohnungsangebot/'
      ebgURL = 'http://www.ebg-wohnen.at/Suche.aspx';
      szbURL = 'https://www.sozialbau.at/unser-angebot/sofort-verfuegbar/'
      suURL = 'http://www.siedlungsunion.at/wohnen/sofort';
      egwURL = 'http://www.egw.at/immobilien/bestands-wohnungen/miete/';
      friedenURL = 'http://www.frieden.at/wohnungsangebot';
      heimbauURL = 'https://www.heimbau.at/wohnungen/wiedervermietung';
    }

    let nl = await this.crawlNL(neueslebenURL).catch((err) => {logErr(err);});
    let ebg = await this.crawlEBG(ebgURL).catch((err) => {logErr(err);});

    this.addToFlats(nl);
    this.addToFlats(ebg);

    /*
      ,crawlEGW(egwURL, this)
      ,crawlEBG(ebgURL, this)
      ,crawlSZB(szbURL, this)
      ,crawlSU(suURL, this)
      ,crawlHeimbau(heimbauURL, this)*/

  }
  addToFlats(arr) {
    if (this.flats.length > 0) {
      this.flats.concat(arr);
    }
    try {
      for (let i of arr) {
        this.flats.push(i)
      }
    } catch (err) {
      logErr(err);
    }
  }

  async crawlNL(url) {

    const res1 = await rp({
      'url': url,
      resolveWithFullResponse: true
    });

    let document = new JSDOM(res1.body).window.document;
    let angebot = document.querySelectorAll('.unstyled');

    let res2arr = [];
    for (let i = 0; i < angebot.length; i++) {
      let amount = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML)
      if (amount > 0) {
        let res2 = await rp({
          'url': 'https://www.wohnen.at' + angebot[i].href,
          resolveWithFullResponse: true
        });
        let building = {
          res: res2,
          angebot: angebot[i]
        };
        await res2arr.push(building);
      }
    }

    let singleFlatsRequests = [];
    for (let i = 0; i < res2arr.length; i++) {
      let document = new JSDOM(res2arr[i].res.body).window.document;
      if (document.querySelectorAll('.units-table')[0] !== undefined) {
        let allFlatsOfBuilding = document.querySelectorAll('.units-table')[0].querySelectorAll('.row');
        for (let x = 0; x < allFlatsOfBuilding.length; x++) {
          let singleFlat = {
            res: await rp({
              'url': 'https://www.wohnen.at' + allFlatsOfBuilding[x].querySelectorAll('div')[0].getAttribute("onclick").split('\'')[1],
              resolveWithFullResponse: true
            }),
            singleFlat: allFlatsOfBuilding[x],
            building: res2arr[i],
          };
          await singleFlatsRequests.push(singleFlat);
        }
      }
    }

    let flats = []
    for (let i = 0; i < singleFlatsRequests.length; i++) {

      let buildingDoc = new JSDOM(singleFlatsRequests[i].building.res.body).window.document;
      let flatDoc = new JSDOM(singleFlatsRequests[i].res.body).window.document;
      let angebot = singleFlatsRequests[i].building.angebot;
      let singleFlat = singleFlatsRequests[i].singleFlat;

      let district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

      adress = singleFlat.querySelectorAll('span')[0].innerHTML.trim();
      [district, city] = buildingDoc.querySelectorAll('.building-page')[0].querySelectorAll('h1')[0].innerHTML.split(',')[0].split(' ');
      link = singleFlatsRequests[i].res.request.uri.href;
      rooms = singleFlat.querySelectorAll('.room')[0].innerHTML;
      size = singleFlat.querySelectorAll('.area')[0].innerHTML;
      legalform = singleFlat.querySelectorAll('.legalForm')[0].innerHTML;
      title = angebot.querySelectorAll('.title')[0].innerHTML.trim() || 'ohne Titel';
      status = angebot.querySelectorAll('.tile-ribbon')[0].innerHTML.trim();
      info = flatDoc.querySelectorAll('.description')[0].innerHTML + flatDoc.querySelectorAll('.master-data')[0].innerHTML;
      docs = flatDoc.querySelectorAll('.materials')[0].querySelectorAll('a');

      //find financing details
      let financing = flatDoc.querySelectorAll('.financing-variant-column');
      costs = ['nicht gefunden'];
      deposit = ['nicht gefunden'];
      funds = ['nicht gefunden'];
      if (financing.length > 0) {
        for (let i = 0; i < financing.length; i++) {
          switch (financing[i].querySelectorAll('.financing-title')[0].innerHTML) {
            case 'monatliche Kosten:':
              costs = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
              break;
            case 'Kaution:':
              deposit = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
              break;
            case 'Eigenmittel:':
              funds = financing[i].querySelectorAll('.financing-value')[0].innerHTML;
              break;
            default:
              break;
          }
        }
      }

      let flat = new Flat(district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
      await flats.push(JSON.stringify(flat));
    }

    return flats;
  }

  /**
   *  TODO deeper search!
   *
   * @param {*} url
   * @returns
   * @memberof Crawler
   */
  async crawlEBG(url) {
    let flats = [];

    let res1 = await rp({
      'url': url,
      resolveWithFullResponse: true
    });

    let document = new JSDOM(res1.body).window.document;
    let angebot = document.querySelector('#MainContent_pnlSearchResultsBig').querySelectorAll('.teaser_wrapper');

    let district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images;

    for (let i = 0; i < angebot.length; i++) {
      link = 'http://www.ebg-wohnen.at/' + angebot[i].getAttribute("onclick").split('\'')[1];
      if (angebot[i].querySelectorAll('.address')[0] && angebot[i].querySelectorAll('.number')[0]) {
        adress = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[1].trim();
        district = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[0];
        city = angebot[i].querySelectorAll('.address')[0].innerHTML.split(',')[0].split(' ')[1];
        rooms = parseInt(angebot[i].querySelectorAll('.number')[0].innerHTML);
      } else {
        adress = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[1];
        district = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[0];
        city = angebot[i].querySelectorAll('.teasercenterdiv')[0].querySelectorAll('h5')[0].innerHTML.trim().split(',')[0].split(' ')[1];
        rooms = "deeper search necessary"
      }

      let flat = new Flat(district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);

      flats.push(JSON.stringify(flat));
    }

    return flats;
  }
}

module.exports = Crawler;