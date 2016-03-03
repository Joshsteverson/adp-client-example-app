'use strict';

var config = require('config');
var server;
var express = require('express');
var PORT = config.get('server.port');
var routes = require('./lib/router');
var log = require('winston');

function start(cb) {
	log.info('Database connection complete.');
	var app = express();
	app.use(routes);
	app.use(express.static('web'));
	server = app.listen(PORT, cb);
}

function stop(cb){
	try{
		server.close(function serverStopCb() {
			if(cb) { cb(); }
		});
	}catch(e){
		if(cb) { return cb(e); }
		process.exit(1);
	}
}

module.exports = {
	start: start,
	stop: stop
};
