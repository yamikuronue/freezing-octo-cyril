var Hapi = require("hapi");

var server = new Hapi.Server();
server.connection({ port: 3000 });

//Route: http://<host>:3000
server.route({
    method: "GET",
    path: "/",
    handler: function (request, reply) {
        reply("Hello, world!");
    }
});

//Route: http://<host>:3000/name
server.route({
    method: "GET",
    path: "/{name}",
    handler: function (request, reply) {
        reply("Hello, " + encodeURIComponent(request.params.name) + "!");
    }
});


server.start(function () {
    console.log("Server running at:", server.info.uri);
});