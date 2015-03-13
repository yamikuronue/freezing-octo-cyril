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

					var deferred = this.async(30000);

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

							var getReq = http.request(getOptions, deferred.callback(function(res1) {
								assert.equal(200, res1.statusCode, "Status code should be 200 OK");

								res1.on("data", function (chunk1) {

									var regex = /^<h1>TODO List:/;
									var result = regex.test(chunk1);
									assert.isTrue(result, "Output did not conform; got " + chunk1);
								});

							}));

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
				}
			}
		});
	}
);