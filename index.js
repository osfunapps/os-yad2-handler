// const StreamZip = require('node-stream-zip');
// const fh = require('os-file-handler');
const ph = require('os-puppeteer-helper');
const tools = require('os-tools');
const eh = require('./dep/excelCreator');
const excelCreator = require('./dep/excelCreator');
const scraper = require('./dep/scraper');

// finals
Q_AND = '&';

// only
Q_ONLY_PRICES = 'priceOnly=1';
Q_ONLY_IMGS = 'imgOnly=1';

// locations
let arrangeByDict = {
    'לפי תאריך': '2',
    'מחיר - מהזול ליקר': '3',
    'מחיר - מהיקר לזול': '4'
};

let cityDict = {
    'צפון': '25',
    'חיפה והסביבה': '5',
    'קריות והסביבה': '6',
    'עכו - נהריה והסביבה': '68',
    'גליל עליון': '20',
    'הכנרת והסביבה': '14',
    'כרמיאל והסביבה': '53',
    'נצרת - שפרעם והסביבה': '91',
    'ראש פינה החולה': '96',
    'גליל תחתון': '74',
    'הגולן': '83',
    'חדרה זכרון ועמקים': '101',
    'זכרון וחוף הכרמל': '67',
    'חדרה והסביבה': '15',
    'קיסריה והסביבה': '16',
    'יקנעם טבעון והסביבה': '87',
    'עמק בית שאן': '93',
    'עפולה והעמקים': '13',
    'רמת מנשה': '97',
    'השרון': '19',
    'נתניה והסביבה': '17',
    'רמת השרון - הרצליה': '18',
    'רעננה - כפר סבא': '42',
    'הוד השרון והסביבה': '54',
    'דרום השרון': '81',
    'צפון השרון': '70',
    'מרכז': '2',
    'תל אביב': '1',
    'תל אביב - מרכז': '48',
    'תל אביב - צפון': '47',
    'תל אביב - דרום': '49',
    'תל אביב - מזרח': '73',
    'ראשון לציון והסביבה': '9',
    'חולון - בת ים': '11',
    'רמת גן - גבעתיים': '3',
    'פתח תקווה והסביבה': '4',
    'ראש העין והסביבה': '71',
    'בקעת אונו': '10',
    'רמלה - לוד': '51',
    'בני ברק - גבעת שמואל': '78',
    'עמק איילון': '92',
    'שוהם והסביבה': '98',
    'מודיעין והסביבה': '8',
    'אזור ירושלים': '100',
    'ירושלים': '7',
    'בית שמש והסביבה': '69',
    'הרי יהודה - מבשרת והסביבה': '86',
    'מעלה אדומים והסביבה': '90',
    'יהודה שומרון ובקעת הירדן': '75',
    'ישובי דרום ההר': '88',
    'ישובי שומרון': '45',
    'גוש עציון': '80',
    'בקעת הירדן וצפון ים המלח': '79',
    'אריאל וישובי יהודה': '77',
    'שפלה מישור חוף דרומי': '41',
    'נס ציונה - רחובות': '12',
    'אשדוד - אשקלון והסביבה': '21',
    'גדרה - יבנה והסביבה': '52',
    'קרית גת והסביבה': '72',
    'שפלה': '99',
    'דרום': '43',
    'באר שבע והסביבה': '22',
    'אילת וערבה': '24',
    'ישובי הנגב': '89',
    'הנגב המערבי': '85',
    'דרום ים המלח': '82',

};

let itemConditionDict = {
    'חדש באריזה': '1',
    'כמו חדש': '2',
    'משומש': '3',
    'דרוש תיקון/שיפוץ': '4',
    'לא רלוונטי': '5',
};


Q_BASE = 'https://www.yad2.co.il/products/all?info=';
Q_LOCATION_PREFIX = 'area=';
Q_ITEM_CONDITION_PREFIX = 'productCondtion=';
Q_ORDER_PREFIX = 'Order=';

const self = module.exports = {

    /**
     * Will search for a query in Yad2 and produce all of the results to a nice excel file.
     *
     * @param searchText -> your search query. Accepts hebrew
     * @param priceOnly -> toggle to true if items must have price
     * @param imgOnly -> toggle to true if items must have pics
     * @param arrangeBy -> see arrangeByDict for legal values
     * @param citiesArr -> see citiesDict for legal values
     * @param conditionsArr -> see itemConditionDict for legal values
     */
    fetchAndProduceToExcel: async function (searchText,
                                            priceOnly,
                                            imgOnly,
                                            citiesArr = [],
                                            conditionsArr = [],
                                            arrangeBy = 'לפי תאריך',
                                            excelFilePath) {
        let urlFullQueries = buildLinksFromQueries(searchText, priceOnly, imgOnly, citiesArr, conditionsArr, arrangeBy);
        eh.buildWorkbook();
        for (let i = 0; i < urlFullQueries.length; i++) {
            let url = Q_BASE + urlFullQueries[i];
            let listingObjs = await gatherInfoFromPage(url);
            eh.modifyWorkbook(listingObjs, searchText, citiesArr[i], priceOnly, imgOnly, conditionsArr, arrangeBy)
            eh.saveWorkbook(excelFilePath)
        }
    },
};

// Will gather info from a single page
async function gatherInfoFromPage(url) {
    let webEle = await ph.createBrowser(url);
    let browser = webEle[0];
    let page = webEle[1];

    // wait for the 'Next' button, at the bottom, to appear
    await ph.waitForSelector(page, 'div.boxes_row', null)

    console.log("Page opened. Scrape scrape scrape!");
    let listingObjs = await scraper.scrape(page);
    console.log("Scraping done. Closing page in a few seconds");
    await ph.close(browser);
    return listingObjs
}

// Will build the search links from queries
function buildLinksFromQueries(searchQuery, priceOnly, imgsOnly, citiesArr, itemConditionArr, arrangeBy) {

    let queriesList = [];
    let query = '';

    query += encodeURI(searchQuery);
    if (priceOnly) {
        query += Q_AND + Q_ONLY_PRICES
    }
    if (imgsOnly) {
        query += Q_AND + Q_ONLY_IMGS
    }

    // order
    query += Q_AND + Q_ORDER_PREFIX + arrangeByDict[arrangeBy];

    // condition
    let conditionsArr = [];
    for (let i = 0; i < itemConditionArr.length; i++) {
        conditionsArr.push(itemConditionDict[itemConditionArr[i]])
    }
    let conditions = conditionsArr.join(',');
    if (conditions.length !== 0) {
        query += Q_AND + Q_ITEM_CONDITION_PREFIX + conditions;
    }

    // location
    if (citiesArr.length !== 0) {
        for (let i = 0; i < citiesArr.length; i++) {
            let finalQuery = query + Q_AND + Q_LOCATION_PREFIX + cityDict[citiesArr[i]];
            queriesList.push(finalQuery)
        }
    } else {
        queriesList.push(query)
    }
    return queriesList

}