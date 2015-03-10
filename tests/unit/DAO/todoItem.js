define([
    "intern!object",
    "intern/chai!assert",
    "intern/dojo/node!../../../src/dao/todoItems"
    ], function (registerSuite, assert, dao) {
	registerSuite({
		name: "todoItemTests",

		insert: function () {
			var items = dao.getItems();
			assert.isArray(items, "Items was not an array");
			assert.isTrue(items.length < 1,"Items had 1 or more items.");

			dao.addItem("Test", "test", 0, function() {
				var items = dao.getItems();
				assert.isArray(items, "Items was not an array");
				assert.isTrue(items.length === 1,"Items did not contain one item.");
			});

			
		}
	});
});