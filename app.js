var myAuth = require('./auth');

var auth = myAuth.auth;
var sendNotifcationTo = myAuth.sendNotifcationTo;


var timeout = 10000;

const request = require('request');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
var isEqual = require('lodash.isequal');
var nodemailer = require('nodemailer');

//holds the two states of the checked Apartments
var notModified = {};
var modified = {};

//changes to false after first boot
var startBool = true;

checkIfNewApartments();

// https://www.wohnen.at/angebot/unser-wohnungsangebot/
// http://127.0.0.1:8080/
function checkIfNewApartments() {
  var options = {
    'url': 'http://127.0.0.1:8080/'
  };
  request(
    options,
    function (err, res, body) {
      if (err) {
        return console.error('error requesting header:', err);
      }

      var dom = new JSDOM(res.body);
      var angebot = dom.window.document.querySelectorAll('.unstyled');

      if (startBool == true) {
        console.log('> now crawling the website every 5 minutes');

        modifyObject(angebot, 1);
        //sendNotification(getLinks(notModified, modified, angebot));
        modifyObject(angebot, 2);
        startBool = false;
        restartCrawl();
        return;
      } else if (isEqual(notModified, modified)) {
        console.log('isEqual');
        modifyObject(angebot, 2);
        if (!isEqual(notModified, modified)) {
          console.log(' ');
          console.log('modified');
          console.log('do something here!!')
          console.log(' ');

          console.log(compare(notModified, modified));

          //TODO see which element is different and do register for
          //sendNotification(getLinks(notModified, modified, angebot));
          modifyObject(angebot);
          restartCrawl();
          return;
        } else {
          restartCrawl();
          return;
        }
      } else {
        restartCrawl();
        return;
      }
    }
  );
}

function restartCrawl() {
  console.log('timout started');
  //console.log(notModified);
  //console.log(modified);
  setTimeout(function () {
    checkIfNewApartments();
  }, timeout);
  return;
}

/** Modifies the init objects, which then will be compared
 * 
 * @param {JSDOM} angebot //.querySelectorAll('.unstyled')
 * @param {INTEGER} whatToModify //1=noModified 2=modified else=both
 */
function modifyObject(angebot, whatToModify) {
  let titleCount = 1;
  for (let i = 0; i < angebot.length; i++) {
    let title = '';
    let address = '';
    if (angebot[i].querySelectorAll('.title')[0].innerHTML.replace(/\s/g, '').length) {
      title = trim(angebot[i].querySelectorAll('.title')[0].innerHTML);
    } else {
      title = 'no title ' + titleCount;
      titleCount++;
    }
    if (angebot[i].querySelectorAll('.address')[0].innerHTML) {
      address =
        trim(angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[0].innerHTML) +
        ', ' + trim(angebot[i].querySelectorAll('.address')[0].querySelectorAll('span')[1].innerHTML);
    } else {
      address = 'no address';
    }
    if (whatToModify == 1) {
      notModified[title] = {
        apartments: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
        address: address,
        href: angebot[i].href
      };
    } else if (whatToModify == 2) {
      modified[title] = {
        apartments: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
        address: address,
        href: angebot[i].href
      };
    } else {
      notModified[title] = {
        apartments: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
        address: address,
        href: angebot[i].href
      };
      modified[title] = {
        apartments: parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML),
        address: address,
        href: angebot[i].href
      };
    }
  }
}

function sendNotification(links) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  });

  var mailOptions = {
    from: auth.user,
    to: sendNotifcationTo,
    subject: 'NEUES LEBEN - neue Wohnung gefunden!',
    html: links
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

/**
 * Links to register for appartment
 *
 * @param {*} notModified
 * @param {*} modified
 * @param {*} angebot
 * @returns
 */

/*
function getLinks(notModified, modified, angebot) {
  var links = '';
  for (let i = 0; i < notModified.length; i++) {
    if () {
      var anz = 0;
      var anzText = '';
      if (modified[i] >= 0) anz = modified[i];
      else anz = notModified[i];
      if (anz == 1) anzText = 'Wohnung';
      else anzText = 'Wohnungen';

      links += "<h1>Neue Wohnungen:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    } else if () {
      

      links += "<h1>Weniger Wohnungen:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    } else if () {
      

      links += "<h1>Keine Wohnungen mehr:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    }
  }
  return links;
};*/

function trim(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function compare(notM, mod) {

  let diff = {};

  var keysNotMod = Object.keys(notM),
    lenNotMod = keysNotMod.length,
    i = 0,
    propNotMod,
    valueNotMod;
  var keysMod = Object.keys(mod),
    lenMod = keysMod.length,
    y = 0,
    propMod,
    valueMod;

  while (i < lenNotMod) {
    while (y < lenMod) {

      propNotMod = keysNotMod[i];
      valueNotMod = notM[propNotMod];
      propMod = keysMod[y];
      valueMod = mod[propMod];

      if (valueNotMod.apartments !== valueMod.apartments) {
        diff[propMod] = valueMod;
      } else {
        diff[propMod] = 'noChange';
      }


      i += 1;
      y += 1;
    }
  }



  return diff;

}