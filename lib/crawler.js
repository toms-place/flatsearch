const rp = require('request-promise');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;

class Crawler {
  constructor() {
    this.flats = [];
  }
  flats() {
    return this.flats;
  }
  async crawl() {
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

    this.flats.concat(
      await this.crawlNL(neueslebenURL)
    );

    /*
      ,crawlEGW(egwURL, this)
      ,crawlEBG(ebgURL, this)
      ,crawlSZB(szbURL, this)
      ,crawlSU(suURL, this)
      ,crawlHeimbau(heimbauURL, this)*/

  }
  async crawlNL(url) {
    const makeRequest = async () => {

      const res1 = await rp({
        'url': url,
        resolveWithFullResponse: true
      }).catch((err) => {
        console.log('first', err)
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
      
      let singleFlats = []
      for (let i = 0; i < singleFlatsRequests.length; i++) {

        let buildingDoc = new JSDOM(singleFlatsRequests[i].building.res.body).window.document;
        let flatDoc = new JSDOM(singleFlatsRequests[i].res.body);
        let adress = singleFlatsRequests[i].singleFlat.querySelectorAll('span')[0].innerHTML.trim();
        let [district, city] = buildingDoc.querySelectorAll('.building-page')[0].querySelectorAll('h1')[0].innerHTML.split(',')[0].split(' ');

        console.log(district, city, adress);
        console.log(singleFlatsRequests[i].res.request.uri.href)
      }

      return;
    }

    await makeRequest().catch((err) => {
      console.log(err);
    });

  }
}
module.exports = Crawler;