/*
    Class:  FetchFromDB
    Description: This class will fetch the data from database
    Author: Avinash Kumar
    Comments: 
    ES Data Sync History:
    //fromRecord = 5, toRecord=1000;//@26-04-2018 23:36
    //fromRecord = 1000, toRecord=2000;//@27-04-2018 10:25
    //fromRecord = 2000,  toRecord= 5000;//@28-04-2018 12:45
*/
const AWS = require("aws-sdk"),
    { Pool, Client } = require('pg'),
    CryptoJS = require("crypto-js"),
    EncryptionKey = "MA@K#V2SP$BNI9_92*12",
    crypto_key = CryptoJS.enc.Hex.parse("MA@K#V2SP$BNI9_92*12"),
    crypto_iv = CryptoJS.enc.Hex.parse("aztech_providerportal"),
    str2json = require('string-to-json'),
    config = require('./config.json');

AWS.config.update(config.aws);
const client = new Client({
    connectionString: config.db.connectionString,
});

client.connect();

//function to decrypt the Encrypted HL7 data from the Report table
function decryptData(item) {
    var document = {};
    //decrypt the HL7JSON
    var bytes = CryptoJS.AES.decrypt(item.HL7Json, EncryptionKey);
    item.DecryptedHL7JSONData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    //Decrypt the Encrytpted HL7 data
    var parsedHL7Array = CryptoJS.enc.Base64.parse(item.EncryptedHL7);
    var HL7 = parsedHL7Array.toString(CryptoJS.enc.Utf8);
    var medicalReport = str2json.convert(item.DecryptedHL7JSONData).MedicalReport;
    document.Id = item.Id;
    document.Code = item.Code;
    document.CompanyCode = item.CompanyCode;
    document.ParentCode = item.ParentCode;
    document.LanguageCode = item.LanguageCode;
    document.ProviderCode = item.ProviderCode;
    document.PatientCode = item.PatientCode;
    document.Data = item.Data;
    document.ReportStatus = item.ReportStatus;
    document.Status = item.Status;
    document.CreatedBy = item.CreatedBy;
    document.ModifiedBy = item.ModifiedBy;
    document.UpdateCount = item.UpdateCount;
    document.StorageLink = item.StorageLink;
    document.CreatedAt = item.CreatedAt;
    document.ModifiedAt = item.ModifiedAt;
    document.ReportToLocation = item.ReportToLocation;
    document.IsSTAT = item.IsSTAT;
    document.STATChecked = item.STATChecked;
    document.AccessionNo = item.AccessionNo;
    document.medicalReport = JSON.parse(medicalReport);
    document.HL7 = HL7;
    return document;
}


class FetchFromDB {

    constructor() {
        this.records = [];
    }

    readDB(input, callback) {
        const fromRecord = config.app.fromRecord, toRecord = config.app.toRecord,
            query = {
                // give the query a unique name
                name: 'fetch-report',
                text: 'Select * from	( select *, ROW_NUMBER () OVER (ORDER BY "Id")	FROM Public."Report")x where row_number between ' + fromRecord + ' and ' + toRecord
            }
        client.query(query, (err, res) => {
            if (err) {
                console.log(err.stack);
                callback(err, null);
            } else {
                const result = res;
                let records = [];
                result.rows.forEach((item) => {
                    let reportData = decryptData(item);
                    records.push(reportData);
                });
                callback(null, records);
                console.log(records.length);
            }
        });
    }
}

module.exports = FetchFromDB;