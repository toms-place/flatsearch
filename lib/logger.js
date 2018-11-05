const fs = require('fs');
const moment = require('moment-timezone');
var os = require("os");


function logErr(err) {
  if (err.name == 'RequestError') {
    let stack = '';
    for (let i = 0; i < err.stack.length; i++) {
      stack += err.stack[i];
    }
    logOut([stack]);
  } else {
    let stack = '';
    for (let i = 0; i < err.stack.length; i++) {
      stack += err.stack[i];
    }
    logOut([stack]);
  }
}

function logOut(e) {
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


exports.logOut = logOut;
exports.logErr = logErr;