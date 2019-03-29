const fs = require('./fs');
const Crawler = require('./crawler');


const crawler = new Crawler();

start();

async function start() {
  crawler.crawl();
  crawler.notify();
}