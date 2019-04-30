const Flat = require('../model/flat');
const FlatChecker = require('../lib/flatchecker');
const rp = require('request-promise');
const jsdom = require('jsdom');
const {
	JSDOM
} = jsdom;
const logErr = require('../lib/logger').logErr;
const logOut = require('../lib/logger').logOut;
const CronJob = require('cron').CronJob;
const numeral = require('numeral');

class oevwCrawler {
	constructor(iniOutput) {
		this.flatChecker = new FlatChecker(iniOutput);
		this.newFlats = [];
		this.url = 'https://www.oevw.at';
	}

	async crawl(cron) {

		const job = new CronJob(cron, async () => {
			try {
				//console.log('oevwCrawler');

				this.newFlats = [];
				this.newFlats = await this.flatChecker.compare(await this.getFlats());

			} catch (error) {
				console.log(error);
			}
		}, null, null, "Europe/Amsterdam", null, true);
		job.start();

	}

	async getFlats() {

		//propose that there are 2 sites
		let paginationCount = 2;
		let count = 1;
		let pagination = '';
		let flats = [];

		while (count < paginationCount) {
			let res = await rp.get({
				'url': this.url + '/wohnung' + pagination,
				resolveWithFullResponse: true
			}).catch((err) => {
				console.log(err);
			});

			let document = new JSDOM(res.body).window.document;
			//sets the paginationCount
			if (count == 1) {
				paginationCount = document.querySelectorAll('.pagination')[0].querySelectorAll('li').length;
			}

			//crawl flats
			let angebot = document.querySelectorAll('.realty-list .panel');

			for (let i = 0; i < angebot.length; i++) {

				let innerUrl = angebot[i].querySelectorAll('a')[0].href;
				let res = await rp.get({
					'url': this.url + innerUrl,
					resolveWithFullResponse: true
				}).catch((err) => {
					console.log(err);
				});

				let document = new JSDOM(res.body).window.document;

				let district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, crawltime;
				let info = "";
				let images = [];
				let docs = [];

				address = document.querySelectorAll('.address')[0].innerHTML.split(",");
				city = address[0].replace("<span>", "").replace("<span>", "").replace("</span>", "").replace("</span>", "").trim().split(" ");
				address = address[1];
				address = address.trim().split(" ");
				let addressTemp = "";
				for (let string of address) {
					string.replace(/\n+/g, '');
					if (string.length > 0) {
						addressTemp += (string.replace(/\n+/g, '') + " ");
					}
				}

				address = addressTemp;
				district = city[0];
				city = city[1];
				link = this.url + innerUrl;
				size = angebot[i].querySelectorAll('.info-surface .list-item-value')[0].innerHTML;
				size = size.replace("m<sup>2</sup>", "").trim();
				let tempSize = parseFloat(numeral(size).value());
				if (!isNaN(tempSize)) {
					size = tempSize;
				}

				costs = angebot[i].querySelectorAll('.info-price .list-item-value')[0].innerHTML;
				// switch between locales
				numeral.locale('de');
				costs = costs.split(',-')[0];
				let tempCosts = parseFloat(numeral(costs).value());
				if (!isNaN(tempCosts)) {
					costs = tempCosts;
				}

				title = angebot[i].querySelectorAll('.overlay-link')[0].innerHTML;

				let tempRooms = angebot[i].querySelectorAll('.info-rooms')[0];
				if (tempRooms) {
					rooms = parseInt(tempRooms.querySelectorAll('.list-item-value')[0].innerHTML);
				}

				let tempDocs = document.querySelectorAll('.attachment-list')[0];
				if (tempDocs) {
					tempDocs = tempDocs.querySelectorAll('a');
					for (let i = 0; i < tempDocs.length; i++) {
						if (i == 0 || i%2 == 0) {
							docs.push({
								href: tempDocs[i].href,
								text: tempDocs[i].title.replace("Öffne ", "")
							});
						}
					}
				}

				/*
				let infoTemp = document.querySelectorAll('.panel-body p');
				for (let infoLi of infoTemp) {
					infoLi = infoLi.innerHTML.replace(/\n+/g, '').replace(/<br>+/g, "");
					info += infoLi;
				}
				*/

				let imagesTemp = document.querySelectorAll(".slider-photo");
				for (let image of imagesTemp) {
					images.push({
						src: image.src
					})
				}

				crawltime = new Date();

				let flat = new Flat('OEVW', district, city, address, link, rooms, size, costs, deposit, funds, legalform, title, status, info, docs, images, crawltime);
				flats.push(flat);
			}

			//defines the pages to crawl
			count++;
			pagination = '/p/' + (count);
		}

		return flats;
	}
}

module.exports = oevwCrawler;
