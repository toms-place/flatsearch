const Crawler = require('./lib/crawler');
const CronJob = require('cron').CronJob;
const FlatChecker = require('./lib/flatchecker');
const User = require('./lib/user');

if (process.env.NODE_ENV == 'dev') {
  const server = require('./tests/www');
  server.listen(process.env.PORT || 8080);
}


const name = 'Thomas';
const email = 'kontakt@weber-thomas.at';
const filter = [1020, 1030, 1200, 1210, 1220];




let cronTime = '0 */5 9-17 * * *';
startCron(cronTime);





async function startCrawl(callback) {
  let flats;
  const crawler = new Crawler();
  console.log('starting');
  await crawler.crawl();
  flats = crawler.flats;
  //console.log(flats);
  return callback();
}

function startCron(cronTime) {
  if (process.env.NODE_ENV == 'dev') {
    setTimeout(() => {
      startCrawl(() => {
        startCron();
      });
    }, 15000);
  } else {
    const job = new CronJob(cronTime, function () {
      startCrawl();
    });
    job.start();
  }
}



/*
const newFlats = await new FlatChecker(await crawler.flats).compare(); //Object with array of flatsobject and filter function
const user = new User(name, email, filter);

user.alert(newFlats.filter(this.filter));
*/