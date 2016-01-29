/*
 *  bad_list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-23
 *
 *  Deal with data that does not exist
 *  Expect to see just 'null'
 */

var Transport = require('../PlugfestTransport').PlugfestTransport;

var transport = new Transport({
});
transport.list({}, function(ld) {
    if (!ld) {
        break;
    }

    console.log("+", ld.id);
});
