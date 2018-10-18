const server = require('./www');
const Crawler_ebg = require('./crawler_ebg');
const Crawler_nl = require('./crawler_nl');


/* ENV setup */
let PORT = "";
let HOST = process.env.HOST;

if (process.env.PORT) {
  PORT = process.env.PORT;
  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}${PORT}/`);
  });
  PORT = ":" + process.env.PORT
}

let nlURL = "http://" + HOST + PORT;
const neuesleben = new Crawler_nl(nlURL, '0 */1 9-17 * * *', true);
neuesleben.startCrawl();

let ebgURL = 'http://www.ebg-wohnen.at/Suche.aspx';
const ebg = new Crawler_ebg(ebgURL, '0 */5 9-17 * * *', true);
ebg.startCrawl();
