var sandbox; 

define([
    "intern!object",
    "intern/chai!assert",
    "intern/dojo/node!../../../src/dao/todoItems",
    "intern/dojo/node!../../../src/controller/TodoController",
    "intern/dojo/node!sinon"
    ], function (registerSuite, assert, dao, controller, sinon) {
		registerSuite({
			name: "todoControllerTests",
			beforeEach: function() {
				sandbox = sinon.sandbox.create();
			},
			afterEach: function() {
				sandbox.restore();
			},
			
			tests: {
				createList_success: function() {
					/*Setup and mocking*/
					var stub = sandbox.stub(dao, "createList");
					var fakeRow = {
						listID: 42
					};
					stub.yields(null, fakeRow);

					var fakeReq = {
						payload: {
							name: "Fake list"
						}
					};

					var fakeReply = sandbox.spy();

					/*Call OOT*/
					controller.createList(fakeReq, fakeReply);



					/*Verification*/
					assert(stub.called, "DAO was not called");
					assert.equal("Fake list", stub.args[0][0], "Name not passed correctly.");
					assert(fakeReply.calledWith("List created! ID: 42"), "Reply was not sent");
				},
				createList_failure: function() {
					/*Setup and mocking*/
					var stub = sandbox.stub(dao, "createList");
					stub.yields("Fake Error!", null);

					var fakeReq = {
						payload: {
							name: "Fake list"
						}
					};

					var fakeReply = sandbox.spy();

					/*Call OOT*/
					controller.createList(fakeReq, fakeReply);

					/*Verification*/
					assert(stub.called, "DAO was not called");
					assert.equal("Fake list", stub.args[0][0], "Name not passed correctly.");
					assert(fakeReply.called, "Reply was not sent");
					assert.equal("ERROR: Fake Error!", fakeReply.args[0][0], "Reply not sent correctly.");
				},
				fetchList_success: function() {
					/*Setup and mocking*/
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

					var fakeReq = {
						params: {
							id: 69
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
					assert(stubGetName.called, "DAO was not called");
					assert.equal(69, stubGetItems.args[0][0], "List ID not passed correctly.");

					assert(stubGetItems.called, "DAO was not called");
					assert.equal(69, stubGetItems.args[0][0], "List ID not passed correctly.");

					assert(fakeReply.view.called, "Reply was not called");
					assert.equal("listitems", fakeReply.view.args[0][0], "Wrong view invoked");
					assert.deepEqual(fakeReply.view.args[0][1], expected, "Reply args not passed correctly.");
				},
				fetchList_failure: function() {
					/*Setup and mocking*/
					var stub = sandbox.stub(dao, "getItems");
					stub.yields("Fake Error!", null);

					var fakeReq = {
						params: {
							id: 69
						}
					};

					var fakeReply = sandbox.spy();


					/*Call OOT*/
					controller.fetchList(fakeReq, fakeReply);

					/*Verification*/
					assert(stub.called, "DAO was not called");
					assert.equal(69, stub.args[0][0], "Name not passed correctly.");
					assert(fakeReply.called, "Reply was not sent");
					assert.equal("ERROR: Fake Error!", fakeReply.args[0][0], "Reply not sent correctly.");
				},
				addItem_success: function() {
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
						}
					};

					var fakeReply = sandbox.spy();

					/*Call OOT*/
					controller.addItem(fakeReq, fakeReply);


					/*Verification*/
					assert(stub.called, "DAO was not called");
					assert.isTrue(stub.calledWith(75, "Item 1", "The first item", 0), "Information not passed correctly to DAO.");
					assert(fakeReply.calledWith("Item created!"), "Reply was not sent");
				},
				addItem_failure: function() {
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
						}
					};

					var fakeReply = sandbox.spy();

					/*Call OOT*/
					controller.addItem(fakeReq, fakeReply);

					/*Verification*/
					assert(stub.called, "DAO was not called");
					assert.isTrue(stub.calledWith(75, "Item 1", "The first item", 0), "Information not passed correctly to DAO.");
					assert(fakeReply.called, "Reply was not sent");
					assert.equal("ERROR: Fake Error!", fakeReply.args[0][0], "Reply not sent correctly.");
				}
			}

		});
	}
);