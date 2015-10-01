var sinon = require("sinon");
var sandbox; 

var dao = require("../../../src/dao/todoItems");
var sessionDao = require("../../../src/dao/session");
var controller = require("../../../src/controller/TodoController");

var assert = require("chai").assert;
var accepts = require("accepts");

describe("Todo Controller", function() {
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		sessionDao.client = fakeRedis.createClient();
	});
	
	afterEach(function() {
		sandbox.restore();
	});

	it("should be able to create lists", function() {
		var stub = sandbox.stub(dao, "createList");
			var fakeRow = {
				listID: 42
			};
			stub.yields(null, fakeRow);

			var fakeReq = {
				payload: {
					name: "Fake list"
				},
				auth: {
					credentials: "fakeuser"
				},
				raw: {
					req: {
						headers: {
							accept: "application/json"
						}
					}
				}
			};

			var fakeReply = sandbox.spy();

			/*Call OOT*/
			controller.createList(fakeReq, fakeReply);

			/*Verification*/
			assert(stub.called, "DAO was not called");
			assert.equal("fakeuser", stub.args[0][0], "UserID not passed correctly.");
			assert.equal("Fake list", stub.args[0][1], "Name not passed correctly.");
			assert(fakeReply.calledWith({message: "List created!", listID: 42}), "Reply was not sent");
	});

	it("should report errors when creating lists" , function(done) {
		/*Setup and mocking*/
		var stub = sandbox.stub(dao, "createList");
		stub.yields("Fake Error!", null);

		var fakeReq = {
			payload: {
				name: "Fake list"
			},
			auth: {
					credentials: "fakeuser"
				},
			raw: {
				req: {
					headers: {
						accept: "application/json"
					}
				}
			}
		};

		var fakeReply = function(reply) {
			/*Verification*/
			assert(stub.called, "DAO was not called");
			assert.equal("fakeuser", stub.args[0][0], "UserID not passed correctly.");
			assert.equal("Fake list", stub.args[0][1], "Name not passed correctly.");
			assert.equal("Fake Error!", reply, "Reply not sent correctly.");
			done();
		};

		/*Call OOT*/
		controller.createList(fakeReq, fakeReply);

		
	});

	it("should be able to retrieve a list", function() {
		/*Setup and mocking*/
		var stubAuthCheck = sandbox.stub(dao, "userCanSeeList");
		var stubGetItems = sandbox.stub(dao, "getItems");
		var stubGetName = sandbox.stub(dao, "getListNameFromID");
		
		stubAuthCheck.yields(null, true);

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

		var fakeReq = {
			params: {
				id: 69
			},
			auth: {
					credentials: "fakeuser"
				},
			raw: {
				req: {
					headers: {
						accept: "html"
					}
				}
			}
		};

		var fakeReply = {
			view: sandbox.spy()
		};


		var expected = {
			listID: 69,
			listName: "List name",
			items: fakeList
		};

		/*Call OOT*/
		controller.fetchList(fakeReq, fakeReply);


		/*Verification*/
		assert(stubAuthCheck.called, "DAO was not called");
		assert.equal("fakeuser", stubAuthCheck.args[0][0], "User ID not passed correctly.");
		assert.equal(69, stubAuthCheck.args[0][1], "List ID not passed correctly.");
		
		assert(stubGetName.called, "DAO was not called");
		assert.equal(69, stubGetItems.args[0][0], "List ID not passed correctly.");

		assert(stubGetItems.called, "DAO was not called");
		assert.equal(69, stubGetItems.args[0][0], "List ID not passed correctly.");

		assert(fakeReply.view.called, "Reply was not called");
		assert.equal("listitems", fakeReply.view.args[0][0], "Wrong view invoked");
		assert.deepEqual(fakeReply.view.args[0][1], expected, "Reply args not passed correctly.");
	});

	it("should report errors when fetching a list", function(done) {
		/*Setup and mocking*/
		var stub = sandbox.stub(dao, "getItems");
		stub.yields("Fake Error!", null);

		var stubGetName = sandbox.stub(dao, "getListNameFromID");
		stubGetName.yields(null, "List name");

		var fakeReq = {
			params: {
				id: 69
			},
			auth: {
					credentials: "fakeuser"
				},
			raw: {
				req: {
					headers: {
						accept: "application/json"
					}
				}
			}
		};

		var fakeReply = function(reply) {
			/*Verification*/
			assert(stub.called, "DAO was not called");
			assert.equal(69, stub.args[0][0], "Name not passed correctly.");
			assert.equal("Fake Error!", reply, "Reply not sent correctly.");
			done();
		};

		/*Call OOT*/
		controller.fetchList(fakeReq, fakeReply);

		
	});

	it("should be able to add an item", function(done) {
		/*Setup and mocking*/
		var stub = sandbox.stub(dao, "addItem");
		stub.yields(null);

		var fakeReq = {
			params: {
				id: 75
			},
			payload: {
				name: "Item 1",
				text: "The first item",
				state: 0
			},auth: {
					credentials: "fakeuser"
				},
			raw: {
				req: {
					headers: {
						accept: "application/json"
					}
				}
			}
		};

		var fakeReply = function(reply) {
			/*Verification*/
			assert(stub.called, "DAO was not called");
			assert.isTrue(stub.calledWith(75, "Item 1", "The first item", 0), "Information not passed correctly to DAO.");
			assert.deepEqual({message: "Item created!"}, reply, "Reply was not sent correctly");
			done();
		};

		/*Call OOT*/
		controller.addItem(fakeReq, fakeReply);
	});

	it("should report any errors when adding items", function() {
		/*Setup and mocking*/
		var stub = sandbox.stub(dao, "addItem");
		stub.yields("Fake Error!", null);

		var fakeReq = {
			params: {
				id: 75
			},
			payload: {
				name: "Item 1",
				text: "The first item",
				state: 0
			},auth: {
					credentials: "fakeuser"
				},
			raw: {
				req: {
					headers: {
						accept: "application/json"
					}
				}
			}
		};

		var fakeReply = function(reply) {
			/*Verification*/
			assert(stub.called, "DAO was not called");
			assert.isTrue(stub.calledWith(75, "Item 1", "The first item", 0), "Information not passed correctly to DAO.");
			assert.equal("Fake Error!", reply, "Reply not sent correctly.");
		};

		/*Call OOT*/
		controller.addItem(fakeReq, fakeReply);		
	});
});