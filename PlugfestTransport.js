/*
 *  PlugfestTransport.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-23
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var iotdb_transport = require('iotdb-transport');
var _ = iotdb._;

var coap = require('coap');

var path = require('path');
var events = require('events');
var util = require('util');
var url = require('url');

var logger = iotdb.logger({
    name: 'iotdb-transport-plugfest',
    module: 'PlugfestTransport',
});

/* --- constructor --- */

/**
 *  Create a transport for Plugfest.
 */
var PlugfestTransport = function (initd) {
    var self = this;

    self.initd = _.defaults(
        initd, {
            channel: iotdb_transport.channel,
            unchannel: iotdb_transport.unchannel,
        },
        iotdb.keystore().get("/transports/PlugfestTransport/initd"), {
            prefix: "",
            server_host: null,
            server_port: 22001,
        }
    );

    self._emitter = new events.EventEmitter();
    self.native = null;
    self.server_url = null;

    _.net.external.ipv4(function (error, ipv4) {
        if (self.initd.server_host) {
            ipv4 = self.initd.server_host;
        } else if (error) {
            ipv4 = _.net.ipv4();
        }

        var server = coap.createServer();
        server.listen(self.initd.server_port, "0.0.0.0", function (error) {
            if (error) {
                console.log("ERROR", error);
                return;
            }

            self.server_url = "coap://" + ipv4 + ":" + self.initd.server_port;
            console.log("READY", self.server_url);
            process.exit();

            self.native = server;
            self._emitter.emit("server-ready");
        });
    });
};

PlugfestTransport.prototype = new iotdb_transport.Transport();
PlugfestTransport.prototype._class = "PlugfestTransport";

/* --- methods --- */

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.list = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_list(paramd, callback);

    callback({
        end: true,
    });
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.added = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_added(paramd, callback);

    var channel = self.initd.channel(self.initd, paramd.id);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.get = function (paramd, callback) {
    var self = this;

    self._validate_get(paramd, callback);

    var channel = self.initd.channel(self.initd, paramd.id, paramd.band);

    // callback(id, band, null); does not exist
    // OR
    // callback(id, band, undefined); don't know
    // OR
    // callback(id, band, d); data
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.update = function (paramd, callback) {
    var self = this;

    self._validate_update(paramd, callback);

    var channel = self.initd.channel(self.initd, paramd.id, paramd.band);
    var d = self.initd.pack(paramd.value, paramd.id, paramd.band);

    logger.error({
        method: "update",
        channel: channel,
        d: d,
    }, "NOT IMPLEMENTED");

    callback({
        error: new Error("not implemented"),
    });
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.updated = function (paramd, callback) {
    var self = this;

    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    self._validate_updated(paramd, callback);
};

/**
 *  See {iotdb_transport.Transport#Transport} for documentation.
 */
PlugfestTransport.prototype.remove = function (paramd, callback) {
    var self = this;

    self._validate_remove(paramd, callback);

    var channel = self.initd.channel(self.intid, paramd.id, paramd.band);
};

/* --- internals --- */

/**
 *  API
 */
exports.PlugfestTransport = PlugfestTransport;
