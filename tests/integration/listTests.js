var portToUse = 8000; //Easy-switch port toggle

var http = require("http");
var querystring = require("querystring");
var server = require("../../src/server");
var dao = require("../../src/dao/todoItems");
var assert = require("chai").assert;
var Q = require("q");


var sinon = require("sinon");
var sandbox; 

describe("The system", function() {
	before(function(){
		server.start(portToUse);
	});

	after(function() {
		server.stop();
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	});

	it("should respond to an HTML request with HTML", function(done) {
		/*
		Setup 
		*/
		var stubGetItems = sandbox.stub(dao, "getItems");
		var stubGetName = sandbox.stub(dao, "getListNameFromID");

		stubGetName.yields(null, "List name");

		var fakeList = [{
			id: 1,
			name: "Item 1",
			text: "The first item",
			state: 0
		},
		{
			id: 2,
			name: "Item 2",
			text: "The second item",
			state: 1
		}
		];
		stubGetItems.yields(null, fakeList);
		

		/*HTML*/
		var htmlOptions = {
			host: "localhost",
			port: portToUse,
			path: "/list/1",
			method: "GET",
			headers: {
				"Accept": "text/html"
			}
		};

		var req = http.request(htmlOptions, function(res) {
			assert.equal(200, res.statusCode, "Status code should be 200 OK");
			res.setEncoding("utf8");

			assert.include(res.headers["content-type"],"text/html","Server should respond with html");

			/*Todo: in the future, verify the html somehow*/
			done(); 

		});
		req.on("error", function(e) {
			console.log(e);
			assert.fail("Unexpected error when submitting: " + e);
		});
		req.end();

	});

	it("should respond to a JSON request with JSON", function(done) {
		var stubGetItems = sandbox.stub(dao, "getItems");
		var stubGetName = sandbox.stub(dao, "getListNameFromID");

		stubGetName.yields(null, "List name");

		var fakeList = [{
			id: 1,
			name: "Item 1",
			text: "The first item",
			state: 0
		},
		{
			id: 2,
			name: "Item 2",
			text: "The second item",
			state: 1
		}
		];
		stubGetItems.yields(null, fakeList);

		/*JSON*/
		var jsonOptions = {
			host: "localhost",
			port: portToUse,
			path: "/list/1",
			method: "GET",
			headers: {
				"Accept": "application/json"
			}
		};

		var req = http.request(jsonOptions, function(res) {
			assert.equal(200, res.statusCode, "Status code should be 200 OK");
			res.setEncoding("utf8");

			assert.include(res.headers["content-type"],"application/json","Server should respond with json");

			res.on("data", function (chunk) {
				var data = JSON.parse(chunk);

				assert.equal("List name", data.listName, "List name not returned properly");
				assert.equal(1, data.listID, "List ID not returned properly");
				assert.deepEqual(fakeList, data.items, "Items not returned properly");

				done();

			});

		});
		req.on("error", function(e) {
			console.log(e);
			assert.fail("Unexpected error when submitting: " + e);
		});
		req.end();
	});

	it("should respond with HTML by default", function(done) {
		/*
		Setup 
		*/
		var stubGetItems = sandbox.stub(dao, "getItems");
		var stubGetName = sandbox.stub(dao, "getListNameFromID");

		stubGetName.yields(null, "List name");

		var fakeList = [{
			id: 1,
			name: "Item 1",
			text: "The first item",
			state: 0
		},
		{
			id: 2,
			name: "Item 2",
			text: "The second item",
			state: 1
		}
		];
		stubGetItems.yields(null, fakeList);
		

		/*HTML*/
		var htmlOptions = {
			host: "localhost",
			port: portToUse,
			path: "/list/1",
			method: "GET",
			headers: {
				"Accept": "*/*"
			}
		};

		var req = http.request(htmlOptions, function(res) {
			assert.equal(200, res.statusCode, "Status code should be 200 OK");
			res.setEncoding("utf8");

			assert.include(res.headers["content-type"],"text/html","Server should respond with html");
			done();

		});
		req.on("error", function(e) {
			console.log(e);
			assert.fail("Unexpected error when submitting: " + e);
		});
		req.end();

	});
});