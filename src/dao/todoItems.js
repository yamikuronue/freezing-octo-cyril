var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var db;
sqlite3.verbose();
function errorprint(err){
	if(err) console.error(arguments);
};

module.exports = {
	version: "1.0",
	file: "src/dao/todo.db",

	close: function(callback) {
		db.close(callback);
		db = null;
	},

	createDB: function(filename, callback) {
		this.file = filename;
		db = new sqlite3.Database(this.file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(err) {
			if (err) console.log("ERROR: " + err);
		});

		db.serialize();
			db.run("DROP TABLE IF EXISTS TodoItems",errorprint);
			db.run("DROP TABLE IF EXISTS TodoLists",errorprint);

			db.run("CREATE TABLE TodoLists (listID INTEGER PRIMARY KEY, listName TEXT)",errorprint);
			db.run("CREATE TABLE TodoItems (itemID INTEGER PRIMARY KEY, listID INTEGER NOT NULL, itemName TEXT, itemText TEXT, state INTEGER, FOREIGN KEY(listID) REFERENCES TodoLists(listID))",errorprint);

			db.run("PRAGMA foreign_keys = ON");
		db.parallelize();
		if (callback) callback();
	},

	getItems: function(listID, callback) {
		if (!db) {
			var self = this;
			this.createDB(this.file, function() {
				self.getItems(listID, callback);
			});
			return;
		};

		var items = [];

		db.each("SELECT itemID,itemName,itemText,state FROM TodoItems WHERE listID=" + listID, function(err, row) {
			items.push({
				id: row.itemID,
				name: row.itemName,
				text: row.itemText,
				state: !!row.state
			});
		}, function() {
			callback(null, items);
		});
	},

	addItem: function(listID, name, text, state, callback) {
		if (!db) {
			var self = this;
			this.createDB(this.file, function() {
				self.addItem(listID, name, text, state, callback);
			});
			return;
		};


		var stmt = db.prepare("INSERT INTO TodoItems (listID, itemName, itemText, state) VALUES (?,?,?,?)");

		stmt.run(listID, name, text, state, function(err) {
			if (err) {
				callback(err);
			} else {
				stmt.finalize(callback);
			}
		});
	},

	createList: function(listName, callback) {
		if (!db) {
			var self = this;
			this.createDB(this.file, function() {
				self.createList(listName, callback);
			});
			return;
		};

		var stmt = db.prepare("INSERT INTO TodoLists (listName) VALUES (?)");
		stmt.run(listName, function(err) {
			if (err) {
				callback(err);
			} else {
				stmt.finalize();
				db.get("SELECT last_insert_rowid() AS listID FROM TodoLists", callback);
			}
		});
	},

	getLists: function(callback) {
		if (!db) {
			var self = this;
			this.createDB(this.file, function() {
				self.getLists(callback);
			});
			return;
		};

		var items = [];
		db.each("SELECT listID, listName FROM TodoLists", function(err, row){
			items.push({
				id: row.listID,
				name: row.listName
			});
		}, function() {
			//TODO: error handling
			callback(null, items);
		});
	}
};