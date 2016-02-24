'use strict';

var express = require('express');
var router = express.Router();
var log = require('winston');
var adp = require('adp-connection');
var connectionManager = require('./connectionManager');
var ConnectionFactory = adp.ADPAPIConnectionFactory;
var AuthorizationCodeConnType = adp.AuthorizationCodeConnType;
var UserInfo = require('adp-userinfo');
/**
	1. CREATE CONNECTION CONFIGURAITON OBJECT (AuthorizationCodeConnType)
	2. INITIALIZE CONFIG OBJECT
	3. CREATE CONNECTION OBJECT
	4. INITIALIZE CONNECTION OBJECT WITH CONFIG OBJECT. 
	5. SAVE CONNECTION OBJECT TO CONNECTION MANAGER.
	6. OBTAIN AUTHORIZATION REQUEST URL.
	7. REDIRECT. 
*/
router.get('/authenticate', function login(req, res) {
	var connType = new AuthorizationCodeConnType();
	var initObject = {
		clientId: 'ec762f06-7410-4f6d-aa82-969902c1836a',
		clientSecret: '6daf2cd7-4604-46c0-ab43-a645a6571d34',
		apiUrl: 'https://iat-api.adp.com',
		tokenUrl: 'https://iat-api.adp.com/auth/oauth/v2/token',
		authorizationUrl: 'https://iat-accounts.adp.com/auth/oauth/v2/authorize',
		sslKeyPath: 'iatCerts/apiclient_iat.key',
		sslCertPath: 'iatCerts/apiclient_iat.pem',
		callbackUrl: 'http://localhost:8889/callback'
	};
	connType.init(initObject);
	var connectionFactory = new ConnectionFactory();
	var connection = connectionFactory.createConnection('authorization_code');
	connection.init(connType);
	connectionManager.add(connection, function addCb(err, result) {
		if(err) {
			log.error('Error saving connection to store.');
			//return redirect to error.
		}
		var url = connection.getAuthorizationRequest();
		console.log('URL', url);
		res.redirect(url);
	});
});

/**
	8. AUTHORIZATION RESPONSE RECEIVED.
	9. OBTAIN AUTHORIZATION CODE FROM QUERY PARAM.
	10. OBTAIN STATE FROM QUERY PARAM.
	11. MAP TO EXISTING CONNECTION OBJECT IN CONNECTION MANAGER.
	12. SET AUTHORIZATION CODE IN CONNECTION CONFIGURATION.
	13. ONCE CONNECTED REDIRECT TO INDEX WITH STATE.
	14. IF CONNECTION FAILED OR NO CODE WAS RECEIVED, ROUTE TO INDEX WITH ERROR.
*/
router.get('/callback', function callback(req, res){
	var state = req.query.state;
	var code = req.query.code;
	if(!code) {
		log.error('Error, no authorization code received');
	}
	connectionManager.get(state, function getCb(err, conn) {
		if(err) {
			log.error('Opps, no connection.');
			//return redirect to error.
		}
		var connection = conn;
		connection.connType.setAuthorizationCode(code);
		connection.connect(null, function connectCb(err){
			console.log(err);
			if(err) {
				log.error('Connection failed!');
			} else {
				connectionManager.add(connection, function addCb(err) {
					if(err) {
						log.error('Error saving connection to store.');
					}
					res.redirect('index.html?state=' + state);
				});
			}
			
		});
	});
});

/**
	15. RECEIVE SESSION READY REQUEST.
	16. REDIRECT TO INDEX WITH NO PARAMS.
	17. 
*/
router.get('/sessionReady', function sessionReady(req, res) {
	res.redirect('/index.html');
	var state = req.query.state;
	res.end();
});

/**
	1. RECEIVE LOGOUT REQUEST.
	2. FIND SAVED CONNECTION BASED ON STATE QUERY PARAM.
	3. DISCONNECT CONNECTION.
	4. REMOVE CONNECTION FROM CONNECTION MANAGER.
*/
router.get('/logout', function sessionReady(req, res) {
	var state = req.query.state; 
	connectionManager.get(state, function getCb(err, conn) {
		if(err) {
			log.error('Opps, no connection.');
			res.redirect('/index.html');
			res.end();
			return;
		}
		var connection = conn;
		connection.disconnect();
		connectionManager.remove(state, function removeCb(err) {
			if(err) {
				log.error('Error removing connection from store.');
			}
			res.redirect('/index.html');
			res.end();
		});
	});
});
/*
router.get('/getWorkerInfo', function getWorkerInfo(req, res) {
	var state = req.query.state;
	var productFactory = new ProductFactory();
	connectionManager.get(state, function getCb(err, conn) {
		if(err) {
			log.error('Unable to obtain connection from store.');
			//return redirect to error.
		} else {
			var connection = conn;
			var userInfoHelper = productFactory.createApiProduct(connection, 'UserInfo');
			userInfoHelper.getUserInfo(null, function getUserInfoCb(err, data) {
				log.info('UserInfo Return ' + JSON.stringify(data));
				var userInfo = data;
				var workerHelper = productFactory.createApiProduct(connection, 'Worker');
				workerHelper.getWorker({associateoid: userInfo.userInfo.associateOID}, function getWorkerCb(err2, data2) {
					var worker = data2;
					log.info('Worker Return ' + JSON.stringify(worker));
					res.send(worker);
					res.end();
				});
			});
		}
	});
});
*/
router.get('/getUserInfo', function getWorkerInfo(req, res) {
	var state = req.query.state;
	//var productFactory = new ProductFactory();
	connectionManager.get(state, function getCb(err, conn) {
		if(err) {
			log.error('Unable to obtain connection from store.');
			//return redirect to error.
		} else {
			var connection = conn;
			var userInfoHelper = new UserInfo(connection);
			// productFactory.createApiProduct(connection, 'UserInfo');
			userInfoHelper.getUserInfo(null, function getUserInfoCb(err, data) {
				console.log(err);
				log.info('UserInfo Return ' + JSON.stringify(data));
				var userInfo = data;
				res.send(userInfo);
				res.end();
			});
		}
	});
});
/*
router.get('/getCorpDirectory', function getCorpDirectory(req, res) {
	var state = req.query.state;
	var productFactory = new ProductFactory();
	connectionManager.get(state, function getCb(err, conn) {
		if(err) {
			log.error('Unable to obtain connection from store.');
			//return redirect to error.
		} else {
			var connection = conn;
			var corpDirectoryHelper = productFactory.createApiProduct(connection, 'CorpDirectory');
			corpDirectoryHelper.getCorpDirectory(null, function getCorpDirectory(err, data) {
				log.info('CorpDirectory Return ' + JSON.stringify(data));
				var corpDirectory = data;
				res.send(corpDirectory);
				res.end();
			});
		}
	});
});
*/
module.exports = router;
