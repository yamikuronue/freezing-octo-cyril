var redis = require("redis"),
        uuid = require("node-uuid");

module.exports = {
	version: "1.0",

	client = redis.createClient(),

	generateSession: function(userID, callback) {
		var sessionID = uuid.v1();
		module.exports.client.set(sessionID, userID, function(err) {
			module.exports.client.expire(sessionID, 3600); //1 hour expire time
			callback(err,sessionID);
		});
	},

	verifySession: function(token, userID, callback) {
		module.exports.client.get(token, function(err, reply) {
			callback(err, +reply === +userID);
		});
	},

	removeSession: function(token, callback) {
		module.exports.client.del(token, function(err, reply) {
			callback(err, reply >= 1); //Response is number of rows removed, we want boolean
		});
	}

};