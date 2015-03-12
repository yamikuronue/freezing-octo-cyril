var dao = require("../dao/todoItems");


module.exports = {
	createList: function(req, reply) {
		var name = req.payload.name;

		dao.createList(name, function(err, row) {
			//Show view based on error or not error?
			if (err) {
				reply("ERROR: " + err);
			} else {
				reply("List created! ID: " + row.listID);
			}
		});
	},

	fetchList: function(req, reply) {
		var id = req.params.id;

		dao.getItems(id, function(err, items) {
			if (err) {
				reply("ERROR: " + err);
			} else {
				reply("List items: " + row.listID);
			}
		});
	}
};