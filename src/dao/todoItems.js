var fs = require("fs");
var file = "todo.db";
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE, function(err) {
	if (err) console.log("ERROR: " + err);
});

console.log("loaded");

module.exports = {
	version: "1.0",
	createDB: function(filename) {
		sqlite3.verbose();
		file = filename;
		
		db.serialize(function() {
				db.run("CREATE TABLE TodoItems (itemID INTEGER PRIMARY KEY, itemName TEXT, itemText TEXT, state INTEGER)");
		});
	},

	getItems: function() {
		var exists = fs.existsSync(file);
		if (!exists) this.createDB(file);

		var items = [];

		db.each("SELECT itemID,itemName,itemText,state FROM TodoItems", function(err, row) {
			Console.log(row);
			items.push({
				id: row.itemID,
				name: row.itemName,
				text: row.itemText,
				state: !!row.state
			});
		});

		return items;
	},

	addItem: function(name, text, state) {

		db.serialize(function() {
			var stmt = db.prepare("INSERT INTO TodoItems VALUES (?,?,?)");
			stmt.run(name, text, state);
			stmt.finalize();
		});
	}
};