'use strict';

module.exports = {
	db: {
		connection: 'localhost:27017'
	},
	server: {
		host: 'localhost',
		port: 8889
	},
	redis: {
		host: 'localhost',
		port: 6379
	},
	connectionConfigMap: {
		'client_credentials': 'ClientCredentialsConnType',
		'authorization_code': 'AuthorizationCodeConnType'
	}
}