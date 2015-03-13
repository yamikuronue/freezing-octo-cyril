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

	fetchAllLists: function(req, reply) {
		var info = {};
		dao.getLists(function(err, items){
			if (err) {
				reply("ERROR: " + err);
			} else {
				info.items = items;
				reply.view("listlists", info);
			}
		});
	},

	fetchList: function(req, reply) {
		var id = req.params.id;

		

		dao.getListNameFromID(id, function(err, name) {
			if (err) {
					reply("ERROR: " + err);
				} else {

				var info = {};
				info.listName = name;
				info.listID = id;

				dao.getItems(id, function(err, items) {
					if (err) {
						reply("ERROR: " + err);
					} else {
						info.items = items;
						reply.view("listitems", info);
					}
				});
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