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


const neuesleben = new Crawler_nl("http://" + HOST + PORT, 5, true);
neuesleben.startCrawl();

const ebg = new Crawler_ebg('http://www.ebg-wohnen.at/Suche.aspx', 5, true);
ebg.startCrawl();
