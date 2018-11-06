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
  compare(flat) {
    if (this.id == flat.id) return true;
    else return false;
  }
  getHTML() {

    let title = '';
    if (this.title) {
      title = `- ${this.title} `
    }

    let info = '';
    if (this.info) {
      info = `<p>${this.info}</p>`;
    }

    let images = '';
    if (this.images) {
      images = `<h3>Bilder</h3>`
      for (let i = 0; i < this.images.length; i++) {
        images += `<a href="${this.link}"><img width="146px" height="98px" style="margin: 0px 5px 5px 0px;" src="${this.images[i].src}"></a>`;
      }
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

    let details = '';
    if (this.status !== undefined || this.legalform !== undefined || this.costs !== undefined || this.deposit !== undefined || this.funds !== undefined || this.size !== undefined || this.rooms !== undefined) {
      details += `<h3>Details</h3><table>`;
      if (this.status !== undefined) {
        details += `<tr><td>Status:</td> <td>${this.status}</td></tr>`;
      }
      if (this.legalform !== undefined) {
        details += `<tr><td>Art:</td> <td>${this.legalform}</td></tr>`;
      }
      if (this.costs !== undefined) {
        details += `<tr><td>Kosten:</td> <td>${this.costs}</td></tr>`;
      }
      if (this.deposit !== undefined) {
        details += `<tr><td>Kaution:</td> <td>${this.deposit}</td></tr>`;
      }
      if (this.funds !== undefined) {
        details += `<tr><td>Eigenmittel:</td> <td>${this.funds}</td></tr>`;
      }
      if (this.size !== undefined) {
        details += `<tr><td>Größe:</td> <td>${this.size} m&sup2;</td></tr>`;
      }
      if (this.rooms !== undefined) {
        details += `<tr><td>Raumanzahl:</td> <td>${this.rooms}</td></tr>`;
      }
      details += `</table>`;
    }

    let html =
      `<div style="background-color:#eee; color:#333; box-shadow: 5px 5px 5px #aaa;">
        <div style="background-color:#ddd; padding:20px 0px 10px 20px;">
            <a href="${this.link}" style="line-height: 1;">
              <h2>${this.adress}</h2>
            </a>
            <h3 style="line-height: 1;">${this.district} ${this.city} ${title}- ${this.website}</h3>
        </div>
        <div style="padding: 5px 20px 10px 40px;">
          ${details + docs + info + images}
        </div>
      </div>`
    return html;
  }
};

module.exports = Flat;