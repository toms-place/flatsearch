const Flat = require('../flat');
const FlatChecker = require('../flatchecker');
const rp = require('request-promise');
const logErr = require('../logger').logErr;
const logOut = require('../logger').logOut;
const fs = require('fs');


class migraCrawler {
  constructor() {
    this.flatChecker = new FlatChecker();
    this.newFlats = [];
  }

  async crawl() {
    try {
      //logOut('crawlWSUD');
      this.newFlats = [];

      let url = 'https://www.oesw.at/uploads/media/Immobilienangebot.pdf';

      
      let res = await rp({
        'url': url,
        resolveWithFullResponse: true
      });

     // await res.pipe(await fs.createWriteStream('flats.pdf'));


      var pdfParser = require('pdf-parser');

      var PDF_PATH = 'flats.pdf';

      pdfParser.pdf2json(PDF_PATH, function (error, pdf) {
        if (error != null) {
          console.log('asdf', error);
        } else {
          console.log(JSON.stringify(pdf));
        }
      });
      /*
            let flat = new Flat('Wien Süd', district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images);
            await flats.push(JSON.stringify(flat));
            this.newFlats = await this.flatChecker.compare(flats);
      */
    } catch (error) {
      logErr(error);
    }

    return;

  }
}

c()

async function c() {
  let c = new migraCrawler()
  await c.crawl();
}

module.exports = migraCrawler;