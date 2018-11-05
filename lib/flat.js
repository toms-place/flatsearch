class Flat {
  constructor(website, district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images) {
    this.id = adress;
    this.website = website;
    this.district = parseInt(district);
    this.city = city;
    this.adress = adress;
    this.link = link;
    this.rooms = rooms;
    this.size = size;
    this.costs = costs;
    this.deposit = deposit;
    this.funds = funds;
    this.legalform = legalform;
    this.title = title;
    this.status = status;
    this.info = info;
    this.docs = docs;
    this.images = images;
  }
  getHTML() {
    let menuIconStyle = `style="width: 40px;height: 5px;background-color: #333;margin: 10px 0px;"`
    let menuIcon = `<div ${menuIconStyle}></div><div ${menuIconStyle}></div><div ${menuIconStyle}></div>`
    let title = '';
    if (this.title) {
      title = `- ${this.title} `
    }
    let info = '';
    if (this.info) {
      info = `<p>${this.info}</p>`;
    }
    let docs = '';
    if (this.docs) {
      docs = `<h3>Dokumente</h3><ul>`
      for (let i = 0; i < this.docs.length; i++) {
        if (i == this.docs.length - 1) {
          docs += `<li><a href="${this.docs[i].href}">${this.docs[i].text}</a></li></ul>`
        } else {
          docs += `<li><a href="${this.docs[i].href}">${this.docs[i].text}</a></li>`;
        }
      }
    }

    let html =
    `<div style="background-color:#eee; color:#333; box-shadow: 5px 5px 5px #aaa;">` +
      `<div style="background-color:#ddd; height: 80px; padding:20px 0px 0px 20px;">`+
        `<div style="float:left;">`+
          `<a href="${this.link}" style="line-height: 1;"><h2>${this.adress}</h2></a>` +
          `<h3 style="line-height: 1;">${this.district} ${this.city} ${title}- ${this.website}</h3>`+
        `</div>` +
        `<div style=" width: 80px; float:right;">`+
          `<a href="${this.link}"><div style="height:40px; padding: 5px 10px 0px 0px; float:right;">${menuIcon}</div></a>`+
        `</div>`+
      `</div>` +
      `<div style="padding:10px 20px 25px 25px; clear:both;">`+
      `<h3>Details</h3>`+
        `<table>` +
          `<tr><td>Status:</td> <td>${this.status}</td></tr>` +
          `<tr><td>Art:</td> <td>${this.legalform}</td></tr>` +
          `<tr><td>Kosten:</td> <td>${this.costs}</td></tr>` +
          `<tr><td>Kaution:</td> <td>${this.deposit}</td></tr>` +
          `<tr><td>Eigenmittel:</td> <td>${this.funds}</td></tr>` +
          `<tr><td>Größe:</td> <td>${this.size} m&sup2;</td></tr>` +
          `<tr><td>Raumanzahl:</td> <td>${this.rooms}</td></tr>` +
        `</table>`+
        `${docs}`+
        `${info}`+
      `</div>`+
    `</div>`
    return html;
  }
};

module.exports = Flat;