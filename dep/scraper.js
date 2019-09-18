const ph = require('os-puppeteer-helper');
const Listing = require('./listing');
const tools = require('os-tools')

const self = module.exports = {

    // Will scrape all of the needed information from a yad2 page
    scrape: async function (page) {
        let listingContainers = await ph.getElements(page, "div[class='feeditem table']");
        let listingObjs = [];
        let todaysDate = tools.getTodaysDate('/', true).toString

        // run on all of the containers (without advertisements)
        for (let i = 0; i < listingContainers.length; i++) {
            let currContainer = listingContainers[i];
            let commercialType1 = await ph.getElement(currContainer, "div[class='ribbon medium-feed bg_pumpkin_orange']");
            let dateEle = await ph.getElement(currContainer, "span.date");
            if(commercialType1 !== null || dateEle === null) {
                continue
            }

            // gather elements
            let priceEle = await ph.getElement(currContainer, "div[class='price']");
            let nameEle = await ph.getElement(currContainer, "div[class='row-1']");
            let cityEle = await ph.getElement(currContainer, "div[class='row-2']");
            let linkEle = await ph.getElement(currContainer, "div[class='feed_item-v3 feed_item accordion feed_medium showPU']");
            let imgEle = await ph.getElement(currContainer, "img.feedImage");

            let linkBase = 'https://www.yad2.co.il/item/';

            let listing = Object.create(Listing);
            listing.price = await ph.getInnerText(page, priceEle);

            // fix and set date
            let date = await ph.getInnerText(page, dateEle);
            date = date.replace('עודכן ', '')
            date = date.replace('ב ', '')
            date = date.replace('היום', todaysDate)
            listing.date = date

            listing.name = await ph.getInnerText(page, nameEle);
            listing.city = await ph.getInnerText(page, cityEle);

            let linkAttrib = await ph.getAttributeValueFromElement(page, linkEle, 'itemid');
            listing.link = linkBase + linkAttrib;

            let imgLink = await ph.getAttributeValueFromElement(page, imgEle, 'src');
            imgLink = 'https://' + imgLink.substring(2);
            listing.img = imgLink;
            listingObjs.push(listing)
        }

        return listingObjs
    }
};