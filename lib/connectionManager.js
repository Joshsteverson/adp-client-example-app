'use strict';
var log = require('winston');

var adp = require('adp-connection');
var ConnectionFactory = adp.ADPAPIConnectionFactory;
var AuthorizationCodeConnType = adp.AuthorizationCodeConnType;
var ClientCredentialsConnType = adp.ClientCredentialsConnType;

var redis = require('redis');
var config = require('config');
var clientOptions = {
	host: config.get('redis.host'),
	port: config.get('redis.port')
};

var redisClient = redis.createClient(clientOptions);
var redistReady = false;

redisClient.on('ready', function readyCb() {
	console.log('redis ready.');
	redistReady = true;
});

function getProps(conn) {
	var configkeys = Object.keys(conn.connType);
	var out = {connType: {}};
	out.accessToken = conn.accessToken;
	out.granttype = conn.granttype;
	out.state = conn.state;
	configkeys.forEach(function keysForEach(key) {
		if(typeof conn.connType[key] !== 'function') {
			out.connType[key] = conn.connType[key];
		}
	});
	return out;
}

function makeConnectionObject(rawObject) {
	var configMap = config.get('connectionConfigMap');
	var connectionFactory = new ConnectionFactory();
	var conn = new connectionFactory.createConnection(rawObject.granttype);
	var initObject = {};
	var connType;
	if(configMap[rawObject.granttype]) {
		connType = new adp[configMap[rawObject.granttype]]();
		var configKeys = Object.keys(rawObject.connType);
		configKeys.forEach(function keysForEach(key) {
			initObject[key] = rawObject.connType[key];
		});
		connType.init(initObject);
		conn.init(connType);
		conn.accessToken = rawObject.accessToken;
		conn.state = rawObject.state;
	}
	return conn;
}

function ConnectionManager() {

	this.add = function add(conn, cb) {
		var state = conn.state;
		var rawObject = getProps(conn);
		var json = JSON.stringify(rawObject);
		redisClient.del(state, function delCb(err, result) {
			if(err) {
				log.error('Error removing document from store.')
			}
			redisClient.set(state, json, cb);
		});
	};

	this.remove = function remove(key, cb) {
		redisClient.del(key, cb);
	};

	this.get = function get(key, cb) {
		redisClient.get(key, function getCb(err, result) {
			try{
				var rawObject = JSON.parse(result);
				log.info('Found connection in store.')
				cb(null, makeConnectionObject(rawObject));
			} catch(e) {
				log.error('Get from store - Exception: ' + e);
				cb(e, null);
			}
		});
	};

}

module.exports = new ConnectionManager();
