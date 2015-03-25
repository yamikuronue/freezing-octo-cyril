var dao = require("../dao/todoItems");
var accepts = require("accepts");


module.exports = {
	createList: function(req, reply) {
		var name = req.payload.name;
		dao.createList(name, function(err, row) {
			switch(getResponseType(req)) {
				case "json":
					if (err) {
						reply(err);
					} else {
						var info = {message: "List created!", listID: row.listID};
						reply(info);
					}
					
				break;
				case "html":
				default:
					if (err) {
						reply.view("error", err);
					} else {
						reply.redirect("/list/" + row.listID);
					}
				break;
			}
		});
	},

	updateList: function(req, reply) {
		var name = req.payload.name;
		var id = req.params.id;

		dao.renameList(id, name, function(err, row) {
			switch(getResponseType(req)) {
				case "json":
					if (err) {
						reply(err);
					} else {
						var info = {message: "List renamed!"};
						reply(info);
					}
					
				break;
				case "html":
				default:
					if (err) {
						reply.view("error", err);
					} else {
						reply.redirect("/list/" + id);
					}
				break;
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
				switch(getResponseType(req)) {
					case "json":
						if (err) {
							reply(err);
						} else {
							reply(info);
						}
						
					break;
					case "html":
					default:
						if (err) {
							reply.view("error", err);
						} else {
							reply.view("listlists", info);
						}
					break;
				}
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
					info.items = items;

					switch(getResponseType(req)) {
						case "json":
							if (err) {
								reply(err);
							} else {
								reply(info);
							}
							
						break;
						case "html":
						default:
							if (err) {
								reply.view("error", err);
							} else {
								reply.view("listitems", info);
							}
						break;
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
			switch(getResponseType(req)) {
				case "json":
					if (err) {
						reply(err);
					} else {
						var info = {message: "Item created!"};
						reply(info);
					}
					
				break;
				case "html":
				default:
					if (err) {
						reply.view("error", err);
					} else {
						reply.redirect("/list/" + id);
					}
				break;
			}
		});
	},

	completeItem: function(req, reply) {
		var id = req.params.id;

		dao.completeItem(id, function(err) {
			switch(getResponseType(req)) {
				case "json":
					if (err) {
						reply(err);
					} else {
						var info = {message: "Item completed!"};
						reply(info);
					}
					
				break;
				case "html":
				default:
					if (err) {
						reply.view("error", err);
					} else {
						reply.redirect("/list/" + id);
					}
				break;
			}
		});
	}
};

/*Determine what kind of response we want to send */
function getResponseType(req) {
	var header = req.raw.req.headers.accept;

	if (header.indexOf("json") > -1) {
		//application/json, text/json, whatever
		return "json";
	};

	return "html";
}