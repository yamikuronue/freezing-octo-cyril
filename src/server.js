var Hapi = require("hapi");
var TodoController = require("./controller/TodoController");

module.exports = {
	_server: null,

	start: function(port) {
		var server = new Hapi.Server();
		port = port || 3000;
		server.connection({ "port": port });

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
			relativeTo: __dirname
		});

		server.start(function () {
		});

		_server = server;
	}, 

	stop: function(callback) {
		_server.stop(callback);
	}
};