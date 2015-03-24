var dao = require("../dao/todoItems");
var accepts = require("accepts");


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

	updateList: function(req, reply) {
		var name = req.payload.name;

		dao.renameList(name, function(err, row) {
			//Show view based on error or not error?
			if (err) {
				reply("ERROR: " + err);
			} else {
				reply("List renamed!");
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
		var accept = accepts(req.raw.req);
		
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
						switch(accept.type(["json", "html"])) {
							case "json":
								reply(items);
							break;
							default:
								reply.view("listitems", info);
							break;
						}
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
	},

	completeItem: function(req, reply) {
		var id = req.params.id;

		dao.completeItem(id, function(err) {
			if (err) {
				reply("ERROR: " + err);
			} else {
				reply("Item completed!");
			}
		});
	}
};