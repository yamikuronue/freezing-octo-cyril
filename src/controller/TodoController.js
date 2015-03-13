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

		var info = {};
		info.listName = req.params.id; //TODO: make this the name;

		dao.getItems(id, function(err, items) {
			if (err) {
				reply("ERROR: " + err);
			} else {
				info.items = items;
				reply.view("listitems", info);
			}
		});
	},

	addItem: function(req, reply) {
		var id = req.params.id;

		var name = req.payload.name;
		var text = req.payload.text;
		var state = req.payload.state;

		dao.addItem(id, name, text, state, function(err) {
			if (err) {
				reply("ERROR: " + err);
			} else {
				reply("Item created!");
			}
		});
	}
};