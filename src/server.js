var Hapi = require("hapi");
var TodoController = require("./controller/TodoController");
var AuthController = require("./controller/AuthController");

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


		server.route({    // Other assets
			method: "GET",
			path: "/assets/{param*}",
			handler: {
				directory: {
					path: "./assets",
					listing: true
				}
			}
		});

		/*Authentication */
		server.state("session", {
			ttl: null,
			isSecure: false, //TODO: ought to be true
			isHttpOnly: true,
			encoding: "base64json",
			clearInvalid: false, // remove invalid cookies
			strictHeader: true // don't allow violations of RFC 6265
		});

		server.route({
			method: "GET",
			path: "/auth/login",
			handler: AuthController.loginForm
		});

		server.route({
			method: "POST",
			path: "/auth/login",
			handler: AuthController.loginFormParse
		});

		/*List actions*/
		server.route({
			method: "PUT",
			path: "/list/{id}",
			handler: TodoController.updateList
		});

		server.route({
			method: "POST",
			path: "/list/{id}",
			handler: TodoController.updateList
		});

		server.route({
			method: "GET",
			path: "/list",
			handler: TodoController.fetchAllLists
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


		/*Item actions*/
		server.route({
			method: "POST",
			path: "/list/{id}/add",
			handler: TodoController.addItem
		});

		server.route({
			method: "GET",
			path: "/item/{id}/complete",
			handler: TodoController.completeItem
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