var async = require ("async");
var sinon = require("sinon");
var fakeRedis = require("fakeredis");

var dao = require("../../../src/dao/session");

var assert = require("chai").assert;

describe("The session store", function() {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		dao.client = fakeRedis.createClient();
	});
	
	afterEach(function() {
		sandbox.restore();
	});

	it("Should be able to generate a session", function(done) {
		dao.generateSession("1234", function(err, sessID) {
			assert.ok(sessID, "Session id not generated");
			done();
		});
	});

	it("Should be able to retrieve a session it generated", function(done) {
		dao.generateSession("1234", function(err, sessID) {
			assert.isNull(err, "Error should not occur");
			assert.ok(sessID, "Session id not generated");

			dao.verifySession(sessID, "1234", function(err, pass) {
				assert.isTrue(pass, "token did not retrieve successfully");
				done();
			});
		});
	});

	it("Should reject incorrect userID for a given token", function(done) {
		dao.generateSession("1234", function(err, sessID) {
			assert.isNull(err, "Error should not occur");
			assert.ok(sessID, "Session id not generated");

			dao.verifySession(sessID, "4321", function(err, pass) {
				assert.isFalse(pass, "token did not retrieve successfully");
				done();
			});
		});
	});

	it("Should reject invalid token", function(done) {
		dao.generateSession("1234", function(err, sessID) {
			assert.ok(sessID, "Session id not generated");

			dao.verifySession("12345654657", "1234", function(err, pass) {
				assert.isFalse(pass, "token did not retrieve successfully");
				done();
			});
		});
	});

	it("Should expire tokens on demand", function(done) {
		dao.generateSession("1234", function(err, sessID) {
			assert.ok(sessID, "Session id not generated");

			async.series([
				function(callback) {
					dao.verifySession(sessID, "1234", callback);
				},
				function(callback) {
					dao.removeSession(sessID, callback);
				},
				function(callback) {
					dao.verifySession(sessID, "1234", callback);
				}
				],
				function(err, results) {
					var verifyBefore = results[0];
					var deleteSuccess = results[1];
					var verifyAfter = results[2]

					assert.isTrue(verifyBefore, "Session did not retrieve successfully");

					assert.isTrue(deleteSuccess, "Session did not delete successfully");

					assert.isFalse(verifyAfter, "Session still valid after delete!");

					done();
				});
		});
	});

});
