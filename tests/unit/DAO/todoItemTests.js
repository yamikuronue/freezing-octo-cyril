var fs = require("fs");
var IsThere = require("is-there");
var sqlite3 = require("sqlite3");
var async = require ("async");
var sinon = require("sinon");

var dao = require("../../../src/dao/todoItems");

var assert = require("chai").assert;

describe("todoItem DAO", function() {
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		dao.db = null;
		sandbox.restore();
	});

	describe("The database", function() {

		it("should be created implicitly when lists are fetched", function(done) {
			//No explicit DB create
			dao.db = null;

			dao.file = ":memory:";
			dao.getLists(function(err, items) {
				assert.isNotNull(items, "items was null");
				assert.lengthOf(items, 0, "Items already had lists when created");
				dao.close(done);
			});
		});

		it("should be created implicitly when lists are created", function(done) {
			//No explicit DB create
			dao.db = null;

			dao.file = ":memory:";
			dao.createList("implicitCreateTest",function(err, row) {
				assert.isNull(err, "No error should occur.");
				assert.isNotNull(row, "row was null");
				dao.close(done);
			});
		});

		it("should be created implicitly when items are fetched", function(done) {
			//No explicit DB create
			dao.db = null;

			dao.file = ":memory:";
			dao.getItems(1, function(err, items) {
				assert.isNotNull(items, "items was null");
				assert.lengthOf(items, 0, "Items already had items when created");
				dao.close(done);
			});
		});

		it("should be created implicitly when items are created", function(done) {
			//No explicit DB create
			dao.db = null;

			dao.file = ":memory:";
			dao.addItem(12, "Test", "test", 0, function(err) {
					assert.isDefined(err, "Error should occur.");
					assert.equal(err.code, "SQLITE_CONSTRAINT", "Wrong error occurred");
					dao.close(done);
				}
			);
		});

		it("should report any errors when created", function(done) {
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

			dao.createDB(":memory:", function(err) {
					assert.equal(dao.db, mockDB, "DB was not mocked!");
					assert.isTrue(mockDB.run.called, "mockDB was not called");
					assert.isTrue(errorStub.called, "Error was not printed");
					assert.equal(errorStub.args[0][0][0], "Fake error!", "Error was not printed correctly");
					done();
				}
			);
		});
	});

	describe("A todo list", function() {
		it("should be able to be created", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getLists(callback);
				},
				function(callback) {
					dao.createList("insertTest", callback);
				}, 
				function(callback) {
					dao.getLists(callback);
				}
				],
				function(err, results) {
					var listsBeforeInsert = results[1];
					var createdRow = results[2];
					var listsAfterInsert  = results[3];

					assert.isNotNull(listsBeforeInsert, "items was null");
					assert.isTrue(listsBeforeInsert.length === 0, "Items already had lists when created");

					assert.isNotNull(createdRow.listID, "Row did not create successfully.");

					assert.isNotNull(listsAfterInsert, "items was null");
					assert.isTrue(listsAfterInsert.length === 1, "Items did not contain one list");

					done();
				});
		});

		it("should be able to be renamed", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getLists(callback);
				},
				function(callback) {
					dao.createList("insertTest", callback);
				}
				],
				function(err, results) {
					var listsBeforeInsert = results[1];
					var createdRow = results[2];
					
					async.series([
						function(callback) {
							dao.renameList(createdRow.listID, "renamedTest",callback);
						},
						function(callback) {
							dao.getLists(callback);
						}
					],
					function(err, results) {
						var listsAfterRename  = results[1];

						assert.isNotNull(listsAfterRename, "items was null");
						assert.isTrue(listsAfterRename.length === 1, "Items did not contain one list");
						assert.isTrue(listsAfterRename[0].name === "renamedTest", "List was not renamed");
						done();
					});

				});
		});

		it("should report any errors during creation", function(done) {
			var stmtStub = {
				run: sandbox.stub(),
				finalize: function() {}
			};
			stmtStub.run.yields("Fake error!");

			var mockDB = {
				prepare: function() {
					return stmtStub;
				}
			};
			
			dao.db = mockDB;

			dao.createList("This is a list",function(err) {
					assert.isTrue(stmtStub.run.called, "Statement was not called");
					assert.equal(err, "Fake error!");
					done();
				}
			);
		});
	});

	describe("A todo list item", function() {
		it("should be able to be created", function(done) {
			var listID;
			async.series([
				function(callback) {
					dao.createDB(":memory:", callback);
				},
				function(callback) {
					dao.createList("insertTest", function(err, row) {
						listID = row.listID;

						assert.isNotNull(listID);
						callback(err);
					});
				},
				function(callback) {
					dao.getItems(listID, callback); 
				}
			], 
			function (err, results) {
				assert.isUndefined(err, "No error should occur.");

				var items = results[2];
				assert.isArray(items, "Items was not an array");
				assert.isTrue(items.length < 1,"Items had 1 or more items.");

				async.series([
						function(callback) {
							dao.addItem(listID, "Test", "test", 0,callback);
						},
						function(callback) {
							dao.getItems(listID,callback);
						}
					],
					function(err, results) {
						assert.isUndefined(err, "No error should occur.");

						items = results[1];
						assert.isArray(items, "Items was not an array");
						assert.lengthOf(items, 1,"Items did not contain one item.");

						dao.close(function(err) {
							assert.isNull(err, "No error should occur.");
							done();
						});
					});
			});
		});

		it("should throw an error when constraints are violated", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.addItem(12, "Test", "test", 0, callback);
				}
			],
			function(err, results) {
				assert.isDefined(err, "Error should occur.");
				assert.equal(err.code, "SQLITE_CONSTRAINT", "Wrong error occurred");
			done();
			});
		});
	});

	describe("A user", function() {
		it("should be able to be created", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.createUser("Bambi", "Shark", callback);
				}, 
				function(callback) {
					dao.getUsers(callback);
				}
				],
				function(err, results) {
					var usersBeforeInsert = results[1];
					var createdUser = results[2];
					var usersAfterInsert  = results[3];

					assert.isNotNull(usersBeforeInsert, "items was null");
					assert.isTrue(usersBeforeInsert.length === 0, "Items already had lists when created");

					assert.isNotNull(createdUser.userID, "User did not create successfully.");

					assert.isNotNull(usersAfterInsert, "items was null");
					assert.isTrue(usersAfterInsert.length === 1, "Items did not contain one list");

					done();
				});
		});

		it("should be able to be authenticated", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.createUser("Bambi", "Shark", callback);
				}, 
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.authenticateUser("Bambi", "Shark", callback);
				}
				],
				function(err, results) {
					var authenticateSuccess = results[4];
					assert.isTrue(authenticateSuccess, "User did not auth successfully");

					done();
				});
		});

		it("should reject invalid passwords", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.createUser("Bambi", "Shark", callback);
				}, 
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.authenticateUser("Bambi", "Thumper", callback);
				},
				function(callback) {
					dao.authenticateUser("Bambi", "", callback);
				}
				],
				function(err, results) {
					var authenticateSuccess = results[4];
					assert.isFalse(authenticateSuccess, "User got in with an invalid password!");

					authenticateSuccess = results[5];
					assert.isFalse(authenticateSuccess, "User got in with no password!");

					done();
				});
		});

		it("should reject invalid users", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getUsers(callback);
				},
				function(callback) {
					dao.authenticateUser("Bambi", "Thumper", callback);
				}
				],
				function(err, results) {
					var authenticateSuccess = results[2];
					assert.isFalse(authenticateSuccess, "Invalid user got in!");

					done();
				});
		});

		it("should be able to be renamed", function(done) {
			async.series([
				function(callback) {
					dao.createDB(":memory:",callback);
				},
				function(callback) {
					dao.getLists(callback);
				},
				function(callback) {
					dao.createList("insertTest", callback);
				}
				],
				function(err, results) {
					var listsBeforeInsert = results[1];
					var createdRow = results[2];
					
					async.series([
						function(callback) {
							dao.renameList(createdRow.listID, "renamedTest",callback);
						},
						function(callback) {
							dao.getLists(callback);
						}
					],
					function(err, results) {
						var listsAfterRename  = results[1];

						assert.isNotNull(listsAfterRename, "items was null");
						assert.isTrue(listsAfterRename.length === 1, "Items did not contain one list");
						assert.isTrue(listsAfterRename[0].name === "renamedTest", "List was not renamed");
						done();
					});

				});
		});

		it("should report any errors during creation", function(done) {
			var stmtStub = {
				run: sandbox.stub(),
				finalize: function() {}
			};
			stmtStub.run.yields("Fake error!");

			var mockDB = {
				prepare: function() {
					return stmtStub;
				}
			};
			
			dao.db = mockDB;

			dao.createUser("Thumper", "moo", function(err) {
					assert.isTrue(stmtStub.run.called, "Statement was not called");
					assert.equal(err, "Fake error!");
					done();
				}
			);
		});
	});
});