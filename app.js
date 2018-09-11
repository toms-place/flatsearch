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
        console.log('> now crawling the website every 5 minutes');

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

        for (let i = 0; i < angebot.length; i++) {
          modified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
        }

        if (!isEqual(notModified, modified)) {

          console.log(' ');
          console.log('modified');
          console.log('do something here!!')
          console.log(' ');

          //TODO see which element is different and do register for
          sendNotification(getLinks(notModified, modified, angebot));
          console.log('isNotEqu notM', notModified);
          console.log('isNotEqu mod', modified);

          for (let i = 0; i < angebot.length; i++) {
            notModified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
            modified[i] = parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML);
          }
          restartCrawl();
          return;
        } else {

          restartCrawl();
          return;

        }
      }
    }
  );
}

function restartCrawl() {
  setTimeout(function () {
    checkIfNewApartments();
  }, 300000);
  return;
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
function getLinks(notModified, modified, angebot) {
  var links = '';
  for (let i = 0; i < notModified.length; i++) {
    if (notModified[i] < modified[i] && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) > 0 || modified.length == 0 && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) > 0) {
      var anz = 0;
      var anzText = '';
      var title = '';
      var address = '';
      if (modified[i] >= 0) anz = modified[i];
      else anz = notModified[i];
      if (angebot[i].querySelectorAll('.title')[0].innerHTML.replace(/\s/g, '').length) title = angebot[i].querySelectorAll('.title')[0].innerHTML;
      else title = 'no title';
      if (angebot[i].querySelectorAll('.address')[0].innerHTML) address = angebot[i].querySelectorAll('.address')[0].innerHTML;
      else address = "no address";
      if (anz == 1) anzText = 'Wohnung';
      else anzText = 'Wohnungen';

      links += "<h1>Neue Wohnungen:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    } else if (notModified[i] > modified[i] && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) > 0) {
      var anz = 0;
      var anzText = '';
      var title = '';
      var address = '';
      if (modified[i] >= 0) anz = modified[i];
      else anz = notModified[i];
      if (angebot[i].querySelectorAll('.title')[0].innerHTML.replace(/\s/g, '').length) title = angebot[i].querySelectorAll('.title')[0].innerHTML;
      else title = 'no title';
      if (angebot[i].querySelectorAll('.address')[0].innerHTML) address = angebot[i].querySelectorAll('.address')[0].innerHTML;
      else address = "no address";
      if (anz == 1) anzText = 'Wohnung';
      else anzText = 'Wohnungen';

      links += "<h1>Weniger Wohnungen:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    } else if (notModified[i] > modified[i] && parseInt(angebot[i].querySelectorAll('.large-font')[0].innerHTML) == 0) {
      var anz = 0;
      var anzText = '';
      var title = '';
      var address = '';
      if (modified[i] >= 0) anz = modified[i];
      else anz = notModified[i];
      if (angebot[i].querySelectorAll('.title')[0].innerHTML.replace(/\s/g, '').length) title = angebot[i].querySelectorAll('.title')[0].innerHTML;
      else title = 'no title';
      if (angebot[i].querySelectorAll('.address')[0].innerHTML) address = angebot[i].querySelectorAll('.address')[0].innerHTML;
      else address = "no address";
      if (anz == 1) anzText = 'Wohnung';
      else anzText = 'Wohnungen';

      links += "<h1>Keine Wohnungen mehr:</h1><h2>" + title + "</h2><p>" + address + "</p><p><a href='https://www.wohnen.at" + angebot[i].href + "'>" + anz + " " + anzText + "</a></p></br >";
    }
  }
  return links;
};