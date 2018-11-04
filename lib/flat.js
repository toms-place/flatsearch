class Flat {
  constructor(district, city, adress, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images) {
    this.id = adress;
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
    let html =
    `<div style="background-color:#ddd; color:#333; padding:20px; box-shadow: 5px 5px 5px #aaa;">` +
    `<a href="${this.link}"><h2>${this.adress} - ${this.title}</h2></a>` +
    `<h3>${this.district} ${this.city}</h3>` +
    `<ul>` +
      `<li>Status: ${this.status}</li>` +
      `<li>Art: ${this.legalform}</li>` +
      `<li>Kosten: ${this.costs}</li>` +
      `<li>Kaution: ${this.deposit}</li>` +
      `<li>Eigenmittel: ${this.funds}</li>` +
      `<li>Größe: ${this.size} m&sup2;</li>` +
      `<li>Raumanzahl: ${this.rooms}</li>` +
    `</ul>`+
    `<p>${this.info}</p></div>`
    return html;
  }
};

module.exports = Flat;