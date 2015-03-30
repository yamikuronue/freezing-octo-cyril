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
				reply.redirect("/").state("session", JSON.stringify(cookie));
			} else {
				reply.view("loginform", {msg: "Invalid credentials."});
			}
		});
	},
	register: function(req, reply) {
		reply.view("registerForm", {});
	},

	registerParse: function(req, reply) {
		var username = req.payload.username;
		var password = req.payload.password;
		var passwordRepeat = req.payload.passwordRepeat;

		if (!username) {
			reply.view("registerForm", {msg: "Invalid username"});
			return;
		}

		if (!password) {
			reply.view("registerForm", {msg: "Invalid password"});
			return;
		}


		if (password !== passwordRepeat) {
			reply.view("registerForm", {msg: "Password did not match, please try again"});
			return;
		}

		dao.createUser(username, password, function(err) {
			if(err) {
				reply.view("registerForm", {msg: "Error: " + err});
			} else {
				reply.view("loginform", {msg: "Success! You may now log in."});
			}
		});
		
	},
	authScheme: function (server, options) {
		return {
			authenticate: function(request, reply) {
				//reply is the standard hapi reply interface, it accepts err and result parameters in that order.
				//The result parameter should be an object, though the object itself as well as all of its keys are optional if an err is provided.
				
				if (!request.state.session) {
					reply.redirect("/auth/login");
					return;
				}

				var session = JSON.parse(request.state.session);
				Session.verifySession(session.sessionID, session.userID, function(err, result) {
					if (err) {
						reply(err);
					}

					if(!result) {
						reply.redirect("/auth/login").state("session", "", {ttl: 0}); //remove cookie
						return;
					}

					//When authentication is successful, you must call reply.continue(result) where result is an object with a credentials property.
					reply.continue({
						credentials: session.userID //The credentials property can be accessed later as part of the request.auth object.
					});
				});
			}
		};
	},
	createCookie: function(userID, sessionID) {
		return {"userID": userID, "sessionID": sessionID};
	}

};

function validateAuthAttempt(username, password, hapiCallback) {
	var uID;
	dao.authenticateUser(username, password, function(err, isValid) {
		if (!isValid) {
			hapiCallback(err, isValid);
		} else {
			async.waterfall([
				function(callback) {
					dao.getUserIDFromName(username, callback);
				},
				function(userID, callback) {
					uID = userID;
					Session.generateSession(userID, callback);
				},
				function(sessID, callback) {
					hapiCallback(err, isValid, module.exports.createCookie(uID, sessID));
				}
			]);
		};
	});
}