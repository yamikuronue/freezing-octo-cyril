var portToUse = 8000; //Easy-switch port toggle

define([
    "intern!object",
    "intern/chai!assert",
    "intern/dojo/node!../../../src/server",
    "intern/dojo/node!http",
    "intern/dojo/node!querystring"
    ], function (registerSuite, assert, server, http, querystring) {
		registerSuite({
			name: "todoItemTests",
			before: function() {
				server.start(portToUse);
			},
			after: function() {
				server.stop();
			},
			
			tests: {
				createAndFetchList: function() {

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

					var deferred = this.async(10000);

					var req = http.request(postOptions, function(res) {
						assert.equal(200, res.statusCode, "Status code should be 200 OK");

						res.on("data", function (chunk) {
							
							//"List created! ID: 1"

							var regex = /^List created! ID: ([0-9\.]+)$/;
							var result = regex.test(chunk);
							assert.isNotNull(result, "Output did not conform; got " + chunk);
							var listID = regex.exec(chunk)[1];

							var getOptions = {
								host: "localhost",
								port: portToUse,
								path: "/list/" + listID,
								method: "get",
								headers: {
									"Content-Type": "application/x-www-form-urlencoded",
									"Content-Length": postData.length
								}
							};

							console.log("Sending get");
							var getReq = http.request(getOptions, deferred.callback(function(res) {
								assert.equal(200, res.statusCode, "Status code should be 200 OK");
							}));

							getReq.on("error", function(e) {
								assert.fail("Unexpected error when retrieving: " + e);
							});


						});

					});
					req.on("error", function(e) {
						assert.fail("Unexpected error when submitting: " + e);
					});

					req.write(postData);
					req.end();
				}
			}
		});
	}
);