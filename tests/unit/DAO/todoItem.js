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
			var exists = IsThere.sync("unitTest.db");
			if (exists) fs.unlinkSync("unitTest.db");
		},
		afterEach: function() {
			dao.destroy(function() {
				var exists = IsThere.sync("unitTest.db");
				if (exists) fs.unlinkSync("unitTest.db");
			});
			
		},
		createsDB: function() {
			exists = IsThere.sync("unitTest.db");
			assert.isFalse(exists);

			dao.createDB("unitTest.db", function() {
				exists = IsThere.sync("unitTest.db");
				assert.isTrue(exists);
			});
		},
		tests: {
			insert: function () {
				dao.createDB("unitTest.db");
				var items = dao.getItems();
				assert.isArray(items, "Items was not an array");
				assert.isTrue(items.length < 1,"Items had 1 or more items.");

				dao.addItem("Test", "test", 0, function() {
					var items = dao.getItems();
					assert.isArray(items, "Items was not an array");
					assert.isTrue(items.length === 1,"Items did not contain one item.");
				});		
			},

			errors: function() {
				
			}
		}
	});
});