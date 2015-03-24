var portToUse = 8000; //Easy-switch port toggle

var http = require("http");
var querystring = require("querystring");
var server = require("../../src/server");
var assert = require("chai").assert;

describe("The system", function() {
	it("should create and fetch lists", function(done) {
		var postData = querystring.stringify({
			"name" : "Test List 1"
		});


		var postOptions = {
			host: "localhost",
			port: portToUse,
			path: "/list/add",
			method: "post",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": postData.length
			}
		};

		var req = http.request(postOptions, function(res) {
			assert.equal(200, res.statusCode, "Status code should be 200 OK");
			res.setEncoding("utf8");

			res.on("data", function (chunk) {
				
				//"List created! ID: 1"

				var regex = /^List created! ID: ([0-9\.]+)$/;
				var result = regex.test(chunk);
				assert.isTrue(result, "Output did not conform; got " + chunk);
				var listID = regex.exec(chunk)[1];

				var getOptions = {
					host: "localhost",
					port: portToUse,
					path: "/list/" + listID,
					method: "get"
				};

				var getReq = http.request(getOptions, function(res1) {
					assert.equal(200, res1.statusCode, "Status code should be 200 OK");

					res1.on("data", function (chunk1) {

						var regex = /^<h1>TODO List:/;
						assert.match(chunk1, regex, "Output did not conform; got " + chunk1);
						done();
					});

				});

				getReq.on("error", function(e) {
					assert.fail("Unexpected error when retrieving: " + e);
				});

				getReq.end();


			});

		});
		req.on("error", function(e) {
			assert.fail("Unexpected error when submitting: " + e);
		});

		req.write(postData);
		req.end();
	});

	it("should create and fetch lists with items", function(done) {
		var postData = querystring.stringify({
			"name" : "Test List 2"
		});


		var postOptions = {
			host: "localhost",
			port: portToUse,
			path: "/list/add",
			method: "post",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": postData.length
			}
		};

		var req = http.request(postOptions, function(res) {
			assert.equal(200, res.statusCode, "Status code should be 200 OK");
			res.setEncoding("utf8");

			res.on("data", function (chunk) {
				
				//"List created! ID: 1"

				var regex = /^List created! ID: ([0-9\.]+)$/;
				var result = regex.test(chunk);
				var listID = regex.exec(chunk)[1];

				postData = querystring.stringify({
					"name" : "Test Item 1",
					"text" : "This is a test",
					"state" : 0
				});

				postOptions =  {
					host: "localhost",
					port: portToUse,
					path: "/list/" + listID + "/add",
					method: "post",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						"Content-Length": postData.length
					}
				};

				req1 = http.request(postOptions, function(res1) {
					assert.equal(200, res.statusCode, "Status code should be 200 OK");
					res1.setEncoding("utf8");

					res1.on("data", function (chunk0) {

						regex = /^Item created!$/;
						assert.match(chunk0, regex, "Item not created " + chunk0);

						var getOptions = {
							host: "localhost",
							port: portToUse,
							path: "/list/" + listID,
							method: "get"
						};

						var getReq = http.request(getOptions, function(res1) {
							assert.equal(200, res1.statusCode, "Status code should be 200 OK");

							res1.on("data", function (chunk1) {

								var regex = /^<h1>TODO List:/;
								assert.match(chunk1, regex, "Output did not conform; got " + chunk1);

								regex = /Test Item 1/;
								assert.match(chunk1, regex, "Output did not conform; got " + chunk1);

								regex = /This is a test/;
								assert.match(chunk1, regex, "Output did not conform; got " + chunk1);
								done();

							});

						});

						getReq.on("error", function(e) {
							assert.fail("Unexpected error when retrieving: " + e);
						});

						getReq.end();
					});
				});

				req1.on("error", function(e) {
					assert.fail("Unexpected error when submitting item: " + e);
				});

				req1.write(postData);
				req1.end();


			});

		});
		req.on("error", function(e) {
			assert.fail("Unexpected error when submitting list: " + e);
		});

		req.write(postData);
		req.end();
	});
});