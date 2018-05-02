/*
    Class:  WriteES
    Description: This class will write the data into Elastic Search
    Author: Avinash Kumar
*/
const request = require('request'),
    fetchDB = new (require('./fetchDB'))(),
    async = require('async'),
    config = require('./config.json');

const esurl = config.es.endPointUrl;

const writeESIndex = (input, callback)=> {
    let body = '';
    let ESinput = {
        body: '',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        method: 'POST'
    };
    let header = '{"index":{}} \n';
    ESinput.body = body + header + JSON.stringify(input) + '\n';
    request(esurl, ESinput, (error, response, body) => {
        if (error) {
            console.log(error);
            callback(null, "Failure");
        }
        else {
            callback(null, "Success");
        }
    });
}

class WriteES {
    constructor() {
        this.index = 0;
    }

    exec(input, callback) {
        try {
            fetchDB.readDB({}, (error, response) => {
                async.eachSeries(response, (item, inCb) => {
                    writeESIndex(item, (error, response) => {
                        inCb();
                    });
                },
                    (err) => {
                        if (err) console.log(err);
                        callback(null, "Success");  // outer callback
                    });
            });
        } catch (error) {
            console.log(error);
            callback(null, "Failure");
        }
    }
}

module.exports = WriteES;

