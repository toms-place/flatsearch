/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./database.js');
//configuration ===============================================================
mongoose.connect(configDB.url, {
  useNewUrlParser: true
}); // connect to our database

const Crawler = require('./crawler');
const crawler = new Crawler();
const Notifier = require('./notifier');
const notifier = new Notifier();

crawler.crawl();
notifier.notify();