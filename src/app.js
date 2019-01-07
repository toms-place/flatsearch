const fs = require('./fs');
const Crawler = require('./crawler');
const User = require('./user');

const crawler = new Crawler();

start();

async function start() {
  crawler.users = await getUsers();
  crawler.crawl();
  crawler.notify();
}

async function getUsers() {
  let users = [];
  let data;
  try {
    data = await fs.readFile('./users.json');
    let usersJSON = JSON.parse(data);
    for (let key in usersJSON) {
      let user = new User(usersJSON[key].name, usersJSON[key].email, usersJSON[key].filter);
      users.push(user);
    }
  } catch (error) {
    users = null;
    console.log(error);
  }
  return users;
}