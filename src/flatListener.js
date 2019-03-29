const flatEmitter = require('./flatEmitter');

/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./database.js');
//configuration ===============================================================
mongoose.connect(configDB.url, {
  useNewUrlParser: true
}); // connect to our database

const dbUser = require('./model/user');
const User = require('./user');


flatEmitter.on('newFlat', function (flats) {
  for (let user of getUsers()) {
    for (let flat of flats) {
      user.addFlat(flat);
    }
  }
});

module.exports = flatEmitter;

function getUsers() {
  let users = [];

  let user = dbUser.find();

  user.exec(function (err, userdata) {
    if (err) throw err;
    try {
      for (let user of userdata) {
        users.push(new User(new User(user.name, user.mail, user.plz_interests)));
      }
    } catch (error) {
      users = null;
      console.log(error);
    }
  });
  return users;
}