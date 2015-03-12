define([
    "intern!object",
    "intern/chai!assert",
    "intern/dojo/node!../../../src/dao/todoItems",
    "intern/dojo/node!fs",
    "intern/dojo/node!is-there"
    ], function (registerSuite, assert, dao, fs, IsThere) {
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
			createList: function() {
				var deferred = this.async(10000);

				dao.createDB(":memory:", function() {
					dao.getLists(deferred.rejectOnError(function(items) {
							assert.isNotNull(items, "items was null");
							assert.isTrue(items.length === 0, "Items already had lists when created");

							dao.createList("insertTest", deferred.rejectOnError(
							function(err, row) {
								var listID = row.listID;
								assert.isNotNull(listID);
								
								dao.getLists(deferred.callback(function(items) {
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
							function (items) {
								assert.isArray(items, "Items was not an array");
								assert.isTrue(items.length < 1,"Items had 1 or more items.");
								dao.addItem(listID, "Test", "test", 0, function(err) {
									assert.isUndefined(err, "No error should occur.");
									dao.getItems(listID,
										deferred.rejectOnError(
											function(items) {
												assert.isArray(items, "Items was not an array");
												assert.isTrue(items.length === 1,"Items did not contain one item.");
												dao.close(deferred.callback(
													function() {}));
											}
										)
									);
								});
							}
						));
					}));
				});
			}
		}
	});
});