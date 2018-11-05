const fs = require('fs');
const moment = require('moment-timezone');
var os = require("os");


exports.logErr = function (err) {
  if (err.name == 'RequestError') {
    logOut(err.name, err.message);
  } else {
    logOut(err);
  }
}

exports.logOut = function (e) {
  let now = moment().tz('Europe/Amsterdam').format('MMMM Do YYYY, h:mm:ss a');
  if (Array.isArray(e)) {
    for (let i = 0; i < e.length; i++) {
      let info = now + ': ' + e[i] + os.EOL;
      fs.appendFile('./logFile.log', info, 'utf8', (err) => {
        if (err) throw err;
      });
    }
  } else {
    let info = now + ': ' + e + os.EOL;
    fs.appendFile('./logFile.log', info, 'utf8', (err) => {
      if (err) throw err;
    });
  }
}