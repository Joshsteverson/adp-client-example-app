'use strict';

var server = require('./server');
var log = require('winston');

server.start(function startCb() {
	log.info('Server started callback');
});