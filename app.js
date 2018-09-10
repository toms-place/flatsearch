


//sender gmail authentification & notification recipient
var auth = {
  user: '',
  pass: ''
};
var sendNotifcationTo = '';





const request = require('request');
const jsdom = require('jsdom');
const {
  JSDOM
} = jsdom;
var isEqual = require('lodash.isequal');
var nodemailer = require('nodemailer');

//holds the two states of the checked Apartments
var notModified = [];
var modified = [];

//changes to false after first boot
var startBool = true;

checkIfNewApartments()

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
        console.log('> now crawling the website every 10 minutes');
        for (let i = 0; i < angebot.length; i++) {
          notModified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
        }       
        sendNotification(getLinks(notModified, modified, angebot)); 
        for (let i = 0; i < angebot.length; i++) {
          modified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
        }
        startBool = false;
        restartCrawl();
        return;
      }

      if (isEqual(notModified, modified)) {
        //console.log('equal');

        for (let i = 0; i < angebot.length; i++) {
          modified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
        }

        restartCrawl();
        return;

      } else if (!isEqual(notModified, modified)) {

        console.log(' ');
        console.log('modified');
        console.log('do something here!!')
        console.log(' ');

        //TODO see which element is different and do register for
        sendNotification(getLinks(notModified, modified, angebot));
        console.log(NotModified);
        console.log(modified);

        for (let i = 0; i < angebot.length; i++) {
          notModified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
        }

        restartCrawl();
        return;
      }
    }
  );
}

function restartCrawl() {
  setTimeout(function () {
    checkIfNewApartments()
  }, 600000);
}

function sendNotification(links) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
  });

  var linksHref = '';

  for (let i = 0; i < links.length; i++) {
    linksHref += "<p><a href='" + links[i] + "'>" + links[i] + "</a></p>";
  }

  var mailOptions = {
    from: auth.user,
    to: sendNotifcationTo,
    subject: 'NEUES LEBEN - neue Wohnung gefunden!',
    html: "<h1>Neue Wohnung!</h1><p>Diese Gebäude haben neue Wohnungen:</p>" + linksHref
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
function getLinks(notModified, modified, angebot) {
  var links = [];
  let count = 0;
  for (let i = 0; i < notModified.length; i++) {
    if (notModified[i] < modified[i] && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) > 0 || modified.length == 0 && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) > 0) {
      links[count] = 'https://www.wohnen.at' + angebot[i].href;
      count++;
    }
  }
  return links;
};