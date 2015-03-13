var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
sqlite3.verbose();
function errorprint(err){
	if(err) console.error(arguments);
};

module.exports = {
	version: "1.0",
	file: "src/dao/todo.db",
	db: null,

	close: function(callback) {
		this.db.close(callback);
		this.db = null;
	},

	createDB: function(filename, callback) {
		this.file = filename;
		this.db = new sqlite3.Database(this.file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(err) {
			if (err) callback(err);
		});

		this.db.serialize();
			this.db.run("DROP TABLE IF EXISTS TodoItems",errorprint);
			this.db.run("DROP TABLE IF EXISTS TodoLists",errorprint);

			this.db.run("CREATE TABLE TodoLists (listID INTEGER PRIMARY KEY, listName TEXT)",errorprint);
			this.db.run("CREATE TABLE TodoItems (itemID INTEGER PRIMARY KEY, listID INTEGER NOT NULL, itemName TEXT, itemText TEXT, state INTEGER, FOREIGN KEY(listID) REFERENCES TodoLists(listID))",errorprint);

			this.db.run("PRAGMA foreign_keys = ON", errorprint);
		this.db.parallelize();
		if (callback) callback();
	},

	getItems: function(listID, callback) {
		if (!this.db) {
			var self = this;
			this.createDB(this.file, function() {
				self.getItems(listID, callback);
			});
			return;
		};

		var items = [];

		this.db.each("SELECT itemID,itemName,itemText,state FROM TodoItems WHERE listID=" + listID, function(err, row) {
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
		if (!this.db) {
			var self = this;
			this.createDB(this.file, function() {
				self.addItem(listID, name, text, state, callback);
			});
			return;
		};


		var stmt = this.db.prepare("INSERT INTO TodoItems (listID, itemName, itemText, state) VALUES (?,?,?,?)");

		stmt.run(listID, name, text, state, function(err) {
			if (err) {
				callback(err);
			} else {
				stmt.finalize(callback);
			}
		});
	},

	createList: function(listName, callback) {
		if (!this.db) {
			var self = this;
			this.createDB(this.file, function() {
				self.createList(listName, callback);
			});
			return;
		};

		var stmt = this.db.prepare("INSERT INTO TodoLists (listName) VALUES (?)");
		var self = this;
		stmt.run(listName, function(err) {
			if (err) {
				callback(err);
			} else {
				stmt.finalize();
				self.db.get("SELECT last_insert_rowid() AS listID FROM TodoLists", callback);
			}
		});
	},

	getLists: function(callback) {
		if (!this.db) {
			var self = this;
			this.createDB(this.file, function() {
				self.getLists(callback);
			});
			return;
		};

		var items = [];
		this.db.each("SELECT listID, listName FROM TodoLists", function(err, row){
			items.push({
				id: row.listID,
				name: row.listName
			});
		}, function() {
			//TODO: error handling
			callback(null, items);
		});
	},
	getListNameFromID: function(id, callback) {
		if (!this.db) {
			var self = this;
			this.createDB(this.file, function() {
				self.getListNameFromID(id,callback);
			});
			return;
		};

		var stmt = this.db.prepare("SELECT listName FROM TodoLists WHERE listID = ?");
		stmt.get(id, function(err, row) {
			if (err) {
				callback(err, null);
			} else {
				stmt.finalize();
				callback(null, row ? row.listName : null);
			}
		});

	}
};