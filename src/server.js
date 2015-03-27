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

		server.auth.scheme("cookie-based", AuthController.authScheme);
		server.auth.strategy("default", "cookie-based", "required");


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
			ttl: 24 * 60 * 60 * 1000,     // One day
			path: "/",
			encoding: "base64json"
		});

		server.route({
			method: "GET",
			path: "/auth/login",
			config: {
				auth:  false
			},
			handler: AuthController.loginForm
		});

		server.route({
			method: "POST",
			path: "/auth/login",
			config: {
				auth:  false
			},
			handler: AuthController.loginFormParse
		});

		server.route({
			method: "GET",
			path: "/auth/register",
			config: {
				auth:  false
			},
			handler: AuthController.register
		});

		server.route({
			method: "POST",
			path: "/auth/register",
			config: {
				auth:  false
			},
			handler: AuthController.registerParse
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
			config: {
				auth:  {
					mode: "required",
					strategy: "default"
				}
			},
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