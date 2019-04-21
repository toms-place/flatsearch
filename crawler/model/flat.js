/** TODO make mongoose model 
 * add crawl Time
 * 
 */

class Flat {
  constructor(website, district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images, crawlTime) {
    this.id = getHash(address, city, district);
    this.website = website;
    this.district = parseInt(district);
    this.city = city;
    this.address = address;
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
    this.crawlTime = crawlTime;
  }

  isSameAs(flat) {
    if (this.id == flat.id) return true;
    else return false;
  }

  getHTML() {

    try {

      let title = '';
      if (this.title) {
        title = `<h4 style="margin: 0px;">${this.title}</h4>`
      } else {
        title = `<h4 style="margin: 0px;">Neue Wohnung</h4>`
      }

      let info = '';
      if (this.info) {
        info = `<p>${this.info}</p>`;
      }

      let images = '';
      if (this.images) {
        images = `<h3>Bilder</h3><ul style="list-style: none;">`
        for (let i = 0; i < this.images.length; i++) {
          images += `<li><img width="146" height="98" style="margin: 0px 5px 5px 0px;" src="${this.images[i].src}" /></li>`;
        }
        images += `</ul>`
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
      if (this.status !== null || this.legalform !== null || this.costs !== null || this.deposit !== null || this.funds !== null || this.size !== null || this.rooms !== null) {
        details += `<h3>Details</h3><table>`;
        if (this.status !== null) {
          details += `<tr><td>Status:</td> <td>${this.status}</td></tr>`;
        }
        if (this.legalform !== null) {
          details += `<tr><td>Art:</td> <td>${this.legalform}</td></tr>`;
        }
        if (this.costs !== null) {
          details += `<tr><td>Kosten:</td> <td>${this.costs}</td></tr>`;
        }
        if (this.deposit !== null) {
          details += `<tr><td>Kaution:</td> <td>${this.deposit}</td></tr>`;
        }
        if (this.funds !== null) {
          details += `<tr><td>Eigenmittel:</td> <td>${this.funds}</td></tr>`;
        }
        if (this.size !== null) {
          details += `<tr><td>Größe:</td> <td>${this.size} m&sup2;</td></tr>`;
        }
        if (this.rooms !== null) {
          details += `<tr><td>Raumanzahl:</td> <td>${this.rooms}</td></tr>`;
        }
        details += `</table>`;
      }

      let html =
        `<div style="margin: auto auto; padding: 20px 20px;">
        <div style="background-color:#999; color:#333; box-shadow: 5px 5px 5px #aaa;">

          <a href="${this.link}" style="line-height: 1; text-decoration: none;">
            <div style="padding: 12.5px 11px; background: #999; color: white;">
              ${title}
            </div>
          </a>

          <div style="background-color:#ddd; padding:20px;">
              <a href="${this.link}" style="line-height: 1; text-decoration: none;">
                <h2 style="margin: 0px;">${this.address}, ${this.district} ${this.city}</h2>
              </a>
          </div>

          <div style="padding: 5px 20px 10px 40px; background-color:#eee;">
            ${details + docs + info + images}
          </div>

          <div style="padding: 10px; background: #eee; color: #333; text-align:right;">
            <h4 style="margin: 0px; padding: 0px;">${this.website}</h4>
          </div>

          <div style="padding: 12.5px 11px; background: #ddd; color: white; text-align:center;">
            <a style="padding: 10px;" href="https://www.google.com/maps/search/${this.address}+${this.district}+${this.city}">
              <img src="https://img.icons8.com/metro/50/ffffff/marker.png" alt="marker" width="25" height="25">
            </a>
          </div>

        </div>
      </div>`
      return html;
    } catch (error) {
      console.log(error)
    }
  }
};

function getHash(address, city, district) {
  let value = address + city + district;
  let hash = 0,
    i, chr;
  if (value.length === 0) return hash;
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

module.exports = Flat;