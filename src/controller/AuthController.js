var Session = require("../dao/session");
var dao = require("../dao/todoItems");
var async = require ("async");

module.exports = {
	validate: validateAuthAttempt,

	loginForm: function(req, reply) {
		reply.view("loginform", {});
	},

	loginFormParse: function(req, reply) {
		var username = req.payload.username;
		var password = req.payload.password;

		validateAuthAttempt(username, password, function(err, isValid, cookie) {
			if (isValid) {
				reply.redirect("/").state("session", cookie);
			} else {
				reply.view("loginform", {msg: "Invalid credentials."});
			}
		});
	}

};

function validateAuthAttempt(username, password, hapiCallback) {
	dao.authenticateUser(username, password, function(err, isValid) {
		if (!isValid) {
			callback(err, isValid);
		} else {
			async.waterfall([
				function(callback) {
					dao.getUserIDFromName(username, callback);
				},
				function(userID, callback) {
					Session.generateSession(userID, callback);
				},
				function(sessID, callback) {
					hapiCallback(err, isValid, {"userID": userID, "sessionID": sessID});
				}
			]);
		};
	});
}