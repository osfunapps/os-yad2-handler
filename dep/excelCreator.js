const eh = require('os-excel-handler');
const tools = require('os-tools');

wb = null;
const self = module.exports = {

    // Will build an excel file comprising all of the yad 2 information gathered
    modifyWorkbook: function (listingObjs,
                              searchText,
                              city,
                              priceOnly,
                              imgOnly,
                              conditionsArr,
                              arrangeBy) {
        let todaysDate = tools.getTodaysDate('.').toString;
        let sheet = eh.createSheet(this.wb, searchText + ' - ' + todaysDate, true);
        setDynamicContent(sheet, listingObjs);
        setStaticContentAndTitle(sheet, searchText, conditionsArr, city, todaysDate, arrangeBy);
        eh.fitColumnWidthToText(sheet, ['A', 'B', 'C', 'D', 'E'], [1])
    },

    buildWorkbook: function () {
        this.wb = eh.createWorkbook()
    },

    saveWorkbook: function (excelFilePath) {
        eh.saveWorkbook(this.wb, excelFilePath)
    }

};

// Will set all of the elements in their respective positions in an xml file
function setDynamicContent(sheet, listingObjs) {
    for (let i = 0; i < listingObjs.length; i++) {
        let currObj = listingObjs[i];
        let currIdx = i + 3;
        eh.setValue(sheet, 'A' + currIdx, currObj.name);
        eh.setValue(sheet, 'B' + currIdx, currObj.city);
        eh.setValue(sheet, 'C' + currIdx, currObj.price);
        eh.setValue(sheet, 'D' + currIdx, currObj.date);
        eh.setValue(sheet, 'E' + currIdx, currObj.link);
        eh.setValue(sheet, 'F' + currIdx, '=IMAGE("' + currObj.img + ')"');
    }

}

// Will set the headers and styles
function setStaticContentAndTitle(sheet, searchText, conditionsArr, city, todaysDate, arrangeBy) {

    // title
    if(city === undefined) {
        city = 'כל הארץ'
    }

    // menus
    eh.setValue(sheet, 'A2', 'שם');
    eh.setValue(sheet, 'B2', 'מיקום');
    eh.setValue(sheet, 'C2', 'מחיר');
    eh.setValue(sheet, 'D2', 'תאריך עדכון');
    eh.setValue(sheet, 'E2', 'לינק');
    eh.setValue(sheet, 'F2', 'תמונה');

    // criteria row
    let criteriaRow = eh.getRow(sheet, 2);
    eh.alignCenter(criteriaRow);
    eh.setEleStyle(criteriaRow, 'Arial', 12, true, false, 'E9ECF3', '000000');


    // title row
    let titleRow = eh.getRow(sheet, 1);
    eh.setValue(sheet, 'A1', searchText + ' ' + 'במצב ' + conditionsArr.join(' ו') + ' ' + 'מ' + city +', מסודר ' + arrangeBy + ' - ' + todaysDate);
    eh.setRowHeight(titleRow, 25);
    eh.mergeCells(sheet, 'A1', 'F1');
    eh.alignCellCenter(sheet, 'A1');
    eh.setEleStyle(titleRow, 'Arial', 12, true, false, 'CFD7E7', '000000');
}