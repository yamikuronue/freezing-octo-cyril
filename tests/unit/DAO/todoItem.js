define([
    "intern!object",
    "intern/chai!assert",
    "intern/dojo/node!../../../src/dao/todoItems",
    "intern/dojo/node!fs",
    "intern/dojo/node!is-there",
    "intern/dojo/node!sinon",
    "intern/dojo/node!sqlite3"
    ], function (registerSuite, assert, dao, fs, IsThere, sinon, sqlite3) {
	registerSuite({
		name: "todoItemTests",
		before: function() {
			
		},
		after: function() {
		},
		
		tests: {
			createsDB: function() {
				exists = IsThere.sync("/home/vagrant/unitTest.db");
				if (exists) {
					fs.unlinkSync("/home/vagrant/unitTest.db");
					exists = IsThere.sync("/home/vagrant/unitTest.db");
				}
				
				assert.isFalse(exists);

				dao.createDB("/home/vagrant/unitTest.db", function() {
					exists = IsThere.sync("unitTest.db");
					assert.isTrue(exists);
				});

				dao.close(function() {
					fs.unlinkSync("/home/vagrant/unitTest.db");
				});
			},
			implicitDBCreate_OnListFetch: function() {
				var deferred = this.async(10000);

				//No explicit DB create
				dao.file = ":memory:";
				dao.getLists(deferred.rejectOnError(function(err, items) {
					assert.isNotNull(items, "items was null");
					assert.lengthOf(items, 0, "Items already had lists when created");
					dao.close(deferred.callback(function(){}));
				}));
			},
			implicitDBCreate_OnListCreate: function() {
				var deferred = this.async(10000);

				//No explicit DB create
				dao.file = ":memory:";
				dao.createList("implicitCreateTest",deferred.rejectOnError(function(err, row) {
					assert.isNull(err, "No error should occur.");
					assert.isNotNull(row, "row was null");
					dao.close(deferred.callback(function(){}));
				}));
			},
			implicitDBCreate_OnItemFetch: function() {
				var deferred = this.async(10000);

				//No explicit DB create
				dao.file = ":memory:";
				dao.getItems(1, deferred.rejectOnError(function(err, items) {
					assert.isNotNull(items, "items was null");
					assert.lengthOf(items, 0, "Items already had items when created");
					dao.close(deferred.callback(function(){}));
				}));
			},
			implicitDBCreate_OnItemCreate: function() {
				var deferred = this.async(10000);

				//No explicit DB create
				dao.file = ":memory:";
				dao.addItem(12, "Test", "test", 0, deferred.rejectOnError(
					function(err) {
						assert.isDefined(err, "Error should occur.");
						assert.equal(err.code, "SQLITE_CONSTRAINT", "Wrong error occurred");
						dao.close(deferred.callback(function(){}));
					}
				));
			},
			createList: function() {
				var deferred = this.async(10000);

				dao.createDB(":memory:", function() {
					dao.getLists(deferred.rejectOnError(function(err, items) {
							assert.isNotNull(items, "items was null");
							assert.isTrue(items.length === 0, "Items already had lists when created");

							dao.createList("insertTest", deferred.rejectOnError(
							function(err, row) {
								var listID = row.listID;
								assert.isNotNull(listID);
								
								dao.getLists(deferred.callback(function(err, items) {
									assert.isNotNull(items, "items was null");
									assert.isTrue(items.length === 1, "Items did not contain one list");
								}));
							}));

						}));
				});
			},
			insert: function () {
				var deferred = this.async(10000);

				dao.createDB(":memory:", function() {
					dao.createList("insertTest", deferred.rejectOnError(
					function(err, row) {
						var listID = row.listID;
						assert.isNotNull(listID);
						dao.getItems(listID, deferred.rejectOnError(
							function (err, items) {
								assert.isArray(items, "Items was not an array");
								assert.isTrue(items.length < 1,"Items had 1 or more items.");
								dao.addItem(listID, "Test", "test", 0, function(err) {
									assert.isUndefined(err, "No error should occur.");
									dao.getItems(listID,
										deferred.rejectOnError(
											function(err, items) {
												assert.isArray(items, "Items was not an array");
												assert.lengthOf(items, 1,"Items did not contain one item.");
												dao.close(deferred.callback(
													function(err) {
														assert.isNull(err, "No error should occur.");
													}));
											}
										)
									);
								});
							}
						));
					}));
				});
			},
			errorInsertingItem: function() {
				var deferred = this.async(10000);

				dao.createDB(":memory:", function() {
					//Add item to nonexistant list
					dao.addItem(12, "Test", "test", 0, deferred.callback(
						function(err) {
							assert.isDefined(err, "Error should occur.");
							assert.equal(err.code, "SQLITE_CONSTRAINT", "Wrong error occurred");
						}
					));
				});
			}
		} //End tests
	});

	/*The following test suite uses Sinon to test hard-to-produce SQLite errors*/
	registerSuite({
		name: "todoItemErrorTests",
		beforeEach: function() {
			sandbox = sinon.sandbox.create();

		},
		afterEach: function() {
			dao.db = null;
			sandbox.restore();
		},
		
		tests: {
			errorCreatingList: function() {
				var deferred = this.async(10000);
				var stmtStub = {
					run: sandbox.stub()
				};
				stmtStub.run.yields("Fake error!");

				var mockDB = {
					prepare: function() {
						return stmtStub;
					}
				};
				
				dao.db = mockDB;

				dao.createList("This is a list", deferred.callback( 
					function(err) {
						assert.isTrue(stmtStub.run.called, "Statement was not called");
						assert.equal(err, "Fake error!");
					}
				));
			}, 
			errorCreatingDB1: function() {
				var deferred = this.async(10000);

				var mockDB = {
					run: sandbox.stub(),
					serialize: sandbox.stub(),
					parallelize: sandbox.stub()
				};

				mockDB.run.yields("Fake error!");

				var stub = sandbox.stub(sqlite3, "Database");
				stub.returns(mockDB);

				//Since all we do is print to the console, mock that. 
				var errorStub = sandbox.spy(console, "error");

				dao.createDB(":memory:", deferred.callback( 
					function(err) {
						assert.equal(dao.db, mockDB, "DB was not mocked!");
						assert.isTrue(mockDB.run.called, "mockDB was not called");
						assert.isTrue(errorStub.called, "Error was not printed");
						assert.equal(errorStub.args[0][0][0], "Fake error!", "Error was not printed correctly");
					}
				));
			},
			errorCreatingDB2: function() {
				var deferred = this.async(10000);
				var mockDB = {
					run: sandbox.stub(),
					serialize: sandbox.stub(),
					parallelize: sandbox.stub()
				};

				mockDB.run.yields("Fake error!");

				var stub = sandbox.stub(sqlite3, "Database");
				stub.yields("Fake error!");
				stub.returns(mockDB);

				//Since all we do is print to the console, mock that. 
				var errorStub = sandbox.stub(console, "error");

				dao.createDB(":memory:", deferred.callback( 
					function(err) {
						assert.equal(err, "Fake error!", "Error was not returned");
					}
				));
			}
		}//end Tests
	});
});