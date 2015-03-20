var Hapi = require("hapi");
var TodoController = require("./controller/TodoController");

module.exports = {
	_server: null,

	start: function(port) {
		var server = new Hapi.Server( {
			connections: {
				routes: {
					files: {
						relativeTo: __dirname
					}
				}
			}
		});
		port = port || 3000;
		server.connection({ "port": port });


		server.route({    // Other assets If you have
			method: "GET",
			path: "/assets/{param*}",
			handler: {
				directory: {
					path: "./assets",
					listing: true
				}
			}
		});

	/*	//Route: http://<host>:3000/list/<name>
		server.route({
			method: "PUT",
			path: "/list/{id}",
			handler: TodoController.updateList
		});

		server.route({
			method: "POST",
			path: "/list/{id}",
			handler: TodoController.updateList
		});*/

		server.route({
			method: "GET",
			path: "/list",
			handler: TodoController.fetchAllLists
		});

		server.route({
			method: "POST",
			path: "/list/{id}/add",
			handler: TodoController.addItem
		});

		server.route({
			method: "GET",
			path: "/list/{id}",
			handler: TodoController.fetchList
		});

		server.route({
			method: "PUT",
			path: "/list/add",
			handler: TodoController.createList
		});

		server.route({
			method: "POST",
			path: "/list/add",
			handler: TodoController.createList
		});



		/*Views*/
		server.views({
			engines: {
				handlebars: require("handlebars")
			},
			path: "./views",
			relativeTo: __dirname,
			layout: true,
			defaultExtension: "handlebars"
		});

		server.start(function () {
		});

		_server = server;
	}, 

	stop: function(callback) {
		_server.stop(callback);
	}
};