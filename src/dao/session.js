var redis = require("redis"),
        client = redis.createClient(),
        uuid = require("node-uuid");

module.exports = {
	version: "1.0",

	generateSession: function(userID, callback) {
		var sessionID = uuid.v1();
		client.set(sessionID, userID, function(err) {
			client.expire(sessionID, 3600); //1 hour expire time
			callback(err,sessionID);
		});
	},

	verifySession: function(token, userID, callback) {
		client.get(token, function(err, reply) {
			callback(err, +reply === +userID);
		});
	},

	removeSession: function(token, callback) {
		client.del(token, function(err, reply) {
			callback(err, reply >= 1); //Response is number of rows removed, we want boolean
		});
	}

};