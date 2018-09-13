//sender gmail authentification
var auth = {
  user: '',
  pass: ''
};
var timeout = 300000;

//libs
const request = require('request');
const {JSDOM} = require('jsdom');
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
    'url': 'https://www.wohnen.at/angebot/unser-wohnungsangebot/'
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

        console.log('> start: now crawling the website every 5 minutes');
        modifyInitObjects(angebot);
        startBool = false;
        restartCrawl();
        return;

      } else if (startBool == false && isEqual(notModified, modified)) {

        //console.log('> isEqual');
        modifyInitObjects(angebot, 2);

        if (!isEqual(notModified, modified)) {

          console.log('> modified');
          console.log(getChangedApartments(notModified, modified));

          //TODO register for getChangedApartments(notModified, modified)
          let html = getHtml(getChangedApartments(notModified, modified));
          sendNotification(html, 'kontakt@weber-thomas.at');
          sendNotification(html, 'lmoshuber@outlook.com');


          modifyInitObjects(angebot);
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
  setTimeout(function () {
    checkIfNewApartments();
  }, timeout);
  return;
}

/** Modifies the init objects, which then will be compared
 * 
 * @param {JSDOM} angebot //.querySelectorAll('.unstyled')
 * @param {INTEGER} whatToModify //1=notModified 2=modified else=both
 */
function modifyInitObjects(angebot, whatToModify) {
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

/** 
 *
 *
 * @param {*} html
 */
function sendNotification(html, sendNotifcationTo) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  });

  var mailOptions = {
    from: auth.user,
    to: sendNotifcationTo,
    subject: 'NEUES LEBEN - neue Wohnung gefunden!',
    html: html
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

/** Trims whitespace
 *
 *
 * @param {*} str
 * @returns
 */
function trim(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/** returns an object of the Apartments which have changed
 *
 * @param {Object} notM
 * @param {Object} mod
 * @returns {Object} 
 */
function getChangedApartments(notM, mod) {

  let ChangedApartments = {};

  let keysNotMod = Object.keys(notM),
    lenNotMod = keysNotMod.length,
    i = 0,
    propNotMod,
    valueNotMod;
  let keysMod = Object.keys(mod),
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

      if (valueNotMod) {
        if (valueNotMod.apartments !== valueMod.apartments) {
          let newVal = valueMod;
          newVal.apartmentsBefore = valueNotMod.apartments;
          ChangedApartments[propMod] = newVal;
        }
      } else {
        let newVal = valueMod;
        newVal.apartmentsBefore = 0;
        ChangedApartments[propMod] = newVal;
      }

      i += 1;
      y += 1;
    }
  }
  return ChangedApartments;
}



function getHtml(obj) {
  let html = '<h1>Neue Wohnungen:</h1>';

  Object.entries(obj).forEach(
    ([key, value]) => {

      let nowText = '';
      let beforeText = '';
      if (value.apartments == 1) nowText = ' Wohnung ';
      else nowText = ' Wohnungen ';
      if (value.apartmentsBefore == 1) beforeText = ' Wohnung ';
      else beforeText = ' Wohnungen ';

      html += "<h2>" + key + "</h2><p>" + value.address + "</p><p><a href='https://www.wohnen.at" + value.href + "'>" + value.apartments + nowText + "jetzt / " + value.apartmentsBefore + beforeText + "davor</a></p></br >";
    }
  );

  return html;
};